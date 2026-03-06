<?php

namespace App\Controller;

use App\Entity\Contrato;
use App\Repository\ContratoRepository;
use App\Repository\ClienteRepository;
use App\Repository\ServicioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route("/api/contratos")]
class ContratoController extends AbstractController
{
    //1.Listar contratos 
    #[Route("", name: "api_contrato_index", methods: ["GET"])]
    public function index(ContratoRepository $contratoRepository): JsonResponse
    {
        //buscamos solo los contratos que pertenecen a clientes del usuario actual con una consulta
        $contratos = $contratoRepository->createQueryBuilder("c")
            ->join("c.cliente", "cli")
            ->andWhere("cli.usuario = :user")
            ->setParameter("user", $this->getUser())
            ->getQuery()
            ->getResult();

        //devuelve un json con los servicios, mensaje 200 si todo OK, y en grupos para evitar bucles infinitos
        //se incluye cliente y servicio porque sin ellos contrato no tendria lógica
        return $this->json($contratos, 200, [], ["groups" => ["contrato:read", "cliente:read", "servicio:read"]]);
    }

    //2.Lista contrato por id
    #[Route("/{id}", name: "api_contrato_show", methods: ["GET"])]
    public function show(int $id, ContratoRepository $contratoRepository): JsonResponse        
    {
       $contrato = $contratoRepository->find($id);

       //Si el servicio no existe, salta el mensaje y el 404
       if (!$contrato) {
            return $this->json(["message" => "Contrato no encontrado"], 404);
       }

       //si el contrato no tiene cliente O si el cliente del contrato no pertenece al usuario logueado salta error
       if ($contrato->getCliente() === null || $contrato->getCliente()->getUsuario() !== $this->getUser()) {
           return $this->json(["message" => "Acceso denegado, este contrato no te pertenece"], Response::HTTP_FORBIDDEN);
       }

       return $this->json($contrato, 200, [], ["groups" => ["contrato:read", "cliente:read", "servicio:read"]]);
    }

    //3.Crear nuevo contrato
    #[Route("", name: "api_contrato_create", methods: ["POST"])]
    public function create(
        Request $request, 
        EntityManagerInterface $entityManager, 
        ValidatorInterface $validator,
        ClienteRepository $clienteRepository,
        ServicioRepository $servicioRepository
    ): JsonResponse {
        //True transforma en un array asociativo
        $data = json_decode($request->getContent(), true);

        //si el JSON está mal formado o vacío, para
        if (!$data) {
            return $this->json(["message" => "Datos no válidos"], 400);
        }

        $contrato = new Contrato();
        
        $contrato->setEstado($data["estado"] ?? "Activo");
        
        $fechaAltaInfo = $data["fecha_alta"] ?? null;
        if ($fechaAltaInfo) {
            try {
                $fecha = new \DateTime($fechaAltaInfo);//convierte el string introducido en un tipo datetime
                $contrato->setFechaAlta($fecha);//guarda la fecha introducida
            } catch (\Exception $e) {
                return $this->json(["message" => "Formato de fecha de alta no válido"], 400);
            }
        } else {
            $contrato->setFechaAlta(new \DateTime()); //se pone la fecha actual por defecto
        }

        //Buscar y asignar el cliente
        if (!empty($data["cliente_id"])) {//si el  cliente_id no esta vacio, pa lante
            $cliente = $clienteRepository->find($data["cliente_id"]);//busca el id del cliente con el parametro pedido en la funcion
            if (!$cliente || $cliente->getUsuario() !== $this->getUser()) {//Si no hay cliente O el cliente no pertenece al user logueado
                return $this->json(["message" => "Cliente no encontrado o no te pertenece"], Response::HTTP_FORBIDDEN);
            }
            $contrato->setCliente($cliente);
        } else {
            return $this->json(["message" => "El campo cliente_id es obligatorio"], 400);
        }

        //buscar y asignar el servicio
        if (!empty($data["servicio_id"])) {//si el servicio_id no esta vacio, pa lante
            $servicio = $servicioRepository->find($data["servicio_id"]);//busca el id del servicio con el parametro de la funcion
            if (!$servicio || $servicio->getUser() !== $this->getUser()) {////Si no encuentra el servicio O el servicio no pertenece al user logueado
                return $this->json(["message" => "Servicio no encontrado o no te pertenece"], Response::HTTP_FORBIDDEN);
            }
            $contrato->setServicio($servicio);
        } else {
            return $this->json(["message" => "El campo servicio_id es obligatorio"], 400);
        }

        $errores = $validator->validate($contrato);
        
        //comprobacion errores
        if (count($errores) > 0) {
            $mensajesError = [];
            foreach ($errores as $error) {
                $mensajesError[] = [
                    "campo" => $error->getPropertyPath(),
                    "mensaje" => $error->getMessage()
                ];
            }

            //devuelve array asociativo con los errores encontrados y bad request 400
            return $this->json([
                "message" => "Errores de validación",
                "errores" => $mensajesError
            ], 400);
        }

        $entityManager->persist($contrato);
        $entityManager->flush();

        return $this->json($contrato, 201, [], ["groups" => ["contrato:read", "cliente:read", "servicio:read"]]);
    }
    //4.Modificar contrato especifico
    #[Route("/{id}", name: "api_contrato_update", methods: ["PUT", "PATCH"])]
    public function update(
        int $id,
        Request $request, 
        EntityManagerInterface $entityManager, 
        ValidatorInterface $validator,
        ContratoRepository $contratoRepository,
        ServicioRepository $servicioRepository
    ): JsonResponse {
        
        $contrato = $contratoRepository->find($id);
        //Si no existe el contrato, mensaje de error
        if (!$contrato) {
            return $this->json(["message" => "Contrato no encontrado"], 404);
        }

        //Si no hay cliente en el contrato O el cliente de ese contrato no pertenece al usuario logueado
        if ($contrato->getCliente() === null || $contrato->getCliente()->getUsuario() !== $this->getUser()) {
            return $this->json(["message" => "Acceso denegado, este contrato no te pertenece"], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(["message" => "Datos no válidos"], 400);
        }
        
        //se actualiza solo los campos que vengan en la petición
        //isset es como que pregunta si viene la clave x, por ej:'estado' en el paquete que se ha enviado
        if (isset($data["estado"])) {
            $contrato->setEstado($data["estado"]);
        }

        if (isset($data["fecha_alta"])) {
            try {
                $fecha = new \DateTime($data["fecha_alta"]);
                $contrato->setFechaAlta($fecha);
            } catch (\Exception $e) {
                return $this->json(["message" => "Formato de fecha de alta no v�lido"], 400);
            }
        }
        
        //Permitir cambiar el servicio
        if (isset($data["servicio_id"])) {
            $servicio = $servicioRepository->find($data["servicio_id"]);//buscamos el servicio por su id segun los datos de la request
            if (!$servicio || $servicio->getUser() !== $this->getUser()) {//si no existe O ese servicio no pertenece al user logueado
                return $this->json(["message" => "Servicio no encontrado o no te pertenece"], Response::HTTP_FORBIDDEN);
            }
            $contrato->setServicio($servicio);
        }

        $errores = $validator->validate($contrato);

        //Comprobacion errores
        if (count($errores) > 0) {
            $mensajesError = [];
            foreach ($errores as $error) {
                $mensajesError[] = [
                    "campo" => $error->getPropertyPath(),
                    "mensaje" => $error->getMessage()
                ];
            }
            return $this->json(["message" => "Errores de validaci�n", "errores" => $mensajesError], 400);
        }
        $entityManager->flush();

        return $this->json($contrato, 200, [], ["groups" => ["contrato:read", "cliente:read", "servicio:read"]]);
    }

    //5.Borrar contrato
    #[Route("/{id}", name: "api_contrato_delete", methods: ["DELETE"])]
    public function delete(int $id, ContratoRepository $contratoRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $contrato = $contratoRepository->find($id);
        
        if (!$contrato) {
            return $this->json(["message" => "Contrato no encontrado"], 404);
        }
        
        //si no hay cliente en contrato O el cliente dle contrato no pertenece al user logueado, error
        if ($contrato->getCliente() === null || $contrato->getCliente()->getUsuario() !== $this->getUser()) {
            return $this->json(["message" => "Acceso denegado, este contrato no te pertenece"], Response::HTTP_FORBIDDEN);
        }
        
        $entityManager->remove($contrato);
        $entityManager->flush();//guardar en la BD 

        //se devuelve un 204 porque la operacion ha ido bien y ya no hay datos que mostrar en cuanto a esto
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}

