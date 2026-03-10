<?php

namespace App\Controller;

use App\Entity\Servicio;
use App\Repository\ServicioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/servicios')]
class ServicioController extends AbstractController{

    //1.Listar todos los servicios del usuario logueado
    #[Route('', name: 'api_servicio_index', methods: ['GET'])]
    public function index(ServicioRepository $servicioRepository): JsonResponse
    {
        // En vez de findAll() que traería todos los servicios de la base de datos, 
        // buscamos solo los que tienen como dueño al usuario que hace la petición.
        $servicios = $servicioRepository->findBy(['user' => $this->getUser()]);   
        
        //devuelve un json con los servicios, mensaje 200 si todo OK, y en grupos para evitar bucles infinitos
        return $this->json($servicios, 200, [], ['groups' => ['servicio:read']]);
    }

    //2.Listar un servicio especifico por el ID
    #[Route('/{id}',name:'api_servicio_show',methods:['GET'])]
    public function show(int $id,ServicioRepository $servicioRepository):JsonResponse
    {
       $servicio=$servicioRepository->find($id);
        
       //Si el servicio no existe, salta el mensaje y el 404
       if(!$servicio){
            return $this->json(['message'=>'Servicio no encontrado'],404);
       }

       //Comprobamos que el servicio encontrado pertenezca al usuario que lo pide
       if ($servicio->getUser() !== $this->getUser()) {
           return $this->json(['message' => 'Acceso denegado, este servicio no te pertenece'], Response::HTTP_FORBIDDEN);
       }
       
       return $this->json($servicio,200,[],['groups' => ['servicio:read']]);
    } 

    //3.Crear nuevo servicio
    #[Route('',name:'api_servicio_create',methods:['POST'])]
    //Request captura los datos del servicio, EntityManager gestiona la entidad y validator valida que no metan mal los datos
    public function create(Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator):JsonResponse
    {
        //True transforma en un array asociativo
        $data = json_decode($request->getContent(), true);
        
        //Si el JSON está mal formado o vacío, para
        if(!$data){
            //Devuelve mensaje de error y 400 que es peticion incorrecta
            return $this->json(['message'=>'Datos no válidos'],400);
        }

        $servicio=new Servicio();
        
        $servicio->setNombre($data['nombre'] ?? '');
        $servicio->setTipo($data['tipo']??'');
        //Me aseguro de que el tipo de dato que entra sea estricto para evitar errores 
        $servicio->setPrecioMensual((float)($data['precio_mensual'] ?? 0));
        $servicio->setActiva((bool)($data['activa'] ?? false));

        //Se valida la entidad recien creada
        $errores= $validator->validate($servicio);

        //comprobacion errores
        if(count($errores) > 0){
            $mensajesError=[];

            //recorro los errors con un foreach para devolverlos en un array
            foreach($errores as $error){
                $mensajesError[]=[
                    'campo'=> $error->getPropertyPath(),//dice en donde se encuentra el error
                    'mensaje'=>$error->getMessage()
                ];
            }

            //Devuelvo todos los errores que hayan salido y un 400 bad request
            return $this->json([
                'message' => 'Errores de validación',
                'errores' => $mensajesError
            ],400);
        }
        //Asignar el usuario actual al servicio
        $servicio->setUser($this->getUser());

        //Si todo ok, guardo en la BD
        $entityManager->persist($servicio);
        $entityManager->flush();//Revisa que objetos ha hecho persist y guarda

        return $this->json($servicio, 201, [], ['groups' => ['servicio:read']]);
    }

    //4. Modificar servicio ya creado
    #[Route('/{id}', name: 'api_servicio_update', methods: ['PUT', 'PATCH'])]
    public function update(Servicio $servicio, Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator): JsonResponse
    {
        //comprobar que el usuario que intenta modificar es el dueño del servicio
        if ($servicio->getUser() !== $this->getUser()) {
            return $this->json(['message' => 'Acceso denegado, este servicio no te pertenece'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        //se actualiza solo los campos que vengan en la petición
        //isset es como que pregunta si viene la clave x, por ej:'nombre' en el paquete que se ha enviado
        if (isset($data['nombre'])) {
            $servicio->setNombre($data['nombre']);
        }
        if (isset($data['tipo'])) {
            $servicio->setTipo($data['tipo']);
        }
        if (isset($data['precio_mensual'])) {
            $servicio->setPrecioMensual((float)$data['precio_mensual']);
        }
        if (isset($data['activa'])) {
            $servicio->setActiva((bool)$data['activa']);
        }

        $errores = $validator->validate($servicio);

        if (count($errores) > 0) {
            $mensajesError = [];
            foreach ($errores as $error) {
                $mensajesError[] = [
                    'campo' => $error->getPropertyPath(),
                    'mensaje' => $error->getMessage()
                ];
            }
            return $this->json(['message' => 'Errores de validación', 'errores' => $mensajesError], 400);
        }

        $entityManager->flush();

        return $this->json($servicio, 200, [], ['groups' => ['servicio:read']]);
    }

    //5. Borrar un servicio
    #[Route('/{id}', name: 'api_servicio_delete', methods: ['DELETE'])]
    public function delete(Servicio $servicio, EntityManagerInterface $entityManager): JsonResponse
    {
        //hay que comprobar que el usuario que intenta borrar es el dueño del servicio
        if ($servicio->getUser() !== $this->getUser()) {
            return $this->json(['message' => 'Acceso denegado, este servicio no te pertenece'], Response::HTTP_FORBIDDEN);
        }
        $entityManager->remove($servicio);
        $entityManager->flush();
        //se devuelve un 204 porque la operacion ha ido bien y ya no hay datos que mostrar en cuanto a esto
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}


    