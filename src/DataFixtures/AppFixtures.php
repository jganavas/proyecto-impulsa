<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Cliente;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
// Importamos la interfaz para encriptar contraseñas
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    // Inyectamos el servicio en el constructor
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // 1. Datos de prueba de  usuarios
        $usuariosData = [
            ['email' => 'pepe@email.com', 'roles' => ['ROLE_USER', 'ROLE_ADMIN'], 'password' => 'Pass111'],
            ['email' => 'desi@email.com', 'roles' => ['ROLE_USER', 'ROLE_ADMIN'], 'password' => 'Pass222'],
            ['email' => 'andres@email.com', 'roles' => ['ROLE_USER', 'ROLE_ADMIN'], 'password' => 'Pass333'],
            ['email' => 'aitor@email.com', 'roles' => ['ROLE_USER', 'ROLE_ADMIN'], 'password' => 'Pass444'],
        ];

        // 2. Datos de prueba de clientes
        $clientesDePrueba = [
            ['11111111A', 'Juan de la Palmilla', 'juan@palmilla.com', '600111222'],
            ['B22222222', 'Tech Solutions SL', 'contacto@techsolutions.es', '910222333'],
            ['33333333C', 'El michel', 'el.michel@huertamotril.com', '666666666'], 
            ['44444444D', 'Carlos Ruiz', 'carliyos@ruiz.com', '600444555'],
            ['55555555E', 'Armando Gresca', 'armando@gresca.com', '600555666'],
            ['F66666666', 'Churreria Churrasik Park SA', 'info@churrasikpark.es', '910666777'],
            ['77777777G', 'Sara Andonga', 'sara@andonga.com', '600777888'],
            ['H88888888', 'Limpiezas Aidalai', 'luisma@aidalai.es', '910888999']
        ];

        $clienteIndex = 0;

        foreach ($usuariosData as $uData) {
            //creamos usuario
            $user = new User();
            $user->setEmail($uData['email']);
            $user->setRoles($uData['roles']);
            
            //cada usuario usará su propia contraseña
            $hashedPassword = $this->passwordHasher->hashPassword($user, $uData['password']);
            $user->setPassword($hashedPassword);

            $manager->persist($user);

            //Dos clientes por usuario
            for ($i = 0; $i < 2; $i++) {
                $datos = $clientesDePrueba[$clienteIndex];
                
                $cliente = new Cliente();
                $cliente->setDniCif($datos[0]);
                $cliente->setNombreCompleto($datos[1]);
                $cliente->setEmailContacto($datos[2]);
                $cliente->setTelefonoContacto((string) $datos[3]);
                //conexion con usuario
                $cliente->setUsuario($user);
                
                $manager->persist($cliente);
                
                $clienteIndex++;
            }
        }
        $manager->flush();
    }
}
