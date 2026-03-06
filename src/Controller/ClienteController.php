<?php

namespace App\Controller;

use App\Entity\Cliente;
use App\Repository\ClienteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/clientes')]
final class ClienteController extends AbstractController
{
    // 1. Listar clientes
    #[Route('', name: 'api_cliente_index', methods: ['GET'])]
    public function index(ClienteRepository $clienteRepository): JsonResponse
    {
        $clientes = $clienteRepository->findBy(['usuario' => $this->getUser()]);
        
        // Usamos 'groups' para evitar bucles infinitos al convertir a JSON
        return $this->json($clientes, 200, [], ['groups' => ['cliente:read']]);
    }

    // 2. Listar un cliente en especifico
    #[Route('/{id}', name: 'api_cliente_show', methods: ['GET'])]
    public function show(Cliente $cliente): JsonResponse
    {
        if ($cliente->getUsuario() !== $this->getUser()) {
            return $this->json(['error' => 'No tienes permiso para acceder a este cliente'], Response::HTTP_FORBIDDEN);
        }
        
        return $this->json($cliente, 200, [], ['groups' => ['cliente:read']]);
    }

    // 3. CREAR UN NUEVO CLIENTE
    #[Route('', name: 'api_cliente_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        // 1. Extraer el JSON que nos envía React en el body de la petición
        $data = json_decode($request->getContent(), true);

        // 2. Crear la entidad
        $cliente = new Cliente();
        $cliente->setDniCif($data['dni_cif'] ?? '');
        $cliente->setNombreCompleto($data['nombre_completo'] ?? '');
        $cliente->setEmailContacto($data['email_contacto'] ?? null); // Opcional
        $cliente->setTelefonoContacto($data['telefono_contacto'] ?? null); // Opcional

        $cliente->setUsuario($this->getUser());

        $errores = $validator->validate($cliente);

        if (count($errores) > 0) {
            // Si hay errores, extraemos los mensajes que escribimos en la entidad
            $mensajesError = [];
            foreach ($errores as $error) {
                $mensajesError[] = $error->getMessage();
            }

            // Devolvemos un 400 Bad Request con la lista de fallos
            return $this->json(['errores' => $mensajesError], Response::HTTP_BAD_REQUEST);
        }

        // 3. Guardar en base de datos
        $em->persist($cliente);
        $em->flush();

        // Devolvemos un 201 (Created) y el cliente recién creado
        return $this->json($cliente, Response::HTTP_CREATED, [], ['groups' => ['cliente:read']]);
    }

    // 4. MODIFICAR UN CLIENTE
    #[Route('/{id}', name: 'api_cliente_update', methods: ['PUT', 'PATCH'])]
    public function update(Request $request, Cliente $cliente, EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        if ($cliente->getUsuario() !== $this->getUser()) {
            return $this->json(['error' => 'No tienes permiso para acceder a este cliente'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        // Actualizamos solo los campos que nos envíen
        if (isset($data['nombre_completo'])) {
            $cliente->setNombreCompleto($data['nombre_completo']);
        }
        if (isset($data['telefono_contacto'])) {
            $cliente->setTelefonoContacto($data['telefono_contacto']);
        }
        if (isset($data['email_contacto'])) {
            $cliente->setEmailContacto($data['email_contacto']);
        }

        $errores = $validator->validate($cliente);

        if (count($errores) > 0) {
            $mensajesError = [];
            foreach ($errores as $error) {
                $mensajesError[] = $error->getMessage();
            }
            
            return $this->json(['errores' => $mensajesError], Response::HTTP_BAD_REQUEST);
        }
        
        $em->flush();

        return $this->json($cliente, 200, [], ['groups' => ['cliente:read']]);
    }

    // 5. BORRAR UN CLIENTE
    #[Route('/{id}', name: 'api_cliente_delete', methods: ['DELETE'])]
    public function delete(Cliente $cliente, EntityManagerInterface $em): JsonResponse
    {
        if ($cliente->getUsuario() !== $this->getUser()) {
            return $this->json(['error' => 'No tienes permiso para acceder a este cliente'], Response::HTTP_FORBIDDEN);
        }

        $em->remove($cliente);
        $em->flush();

        // 204 No Content es el código estándar cuando se borra algo con éxito y no se devuelve nada
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
