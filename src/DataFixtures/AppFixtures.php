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
        // 1. Creamos el usuario
        $user = new User();
        $user->setEmail('pepe@email.com');
        $user->setRoles(['ROLE_USER', 'ROLE_ADMIN']); // Le damos permisos
        
        // 2. Encriptamos la contraseña "Pass123"
        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            'Pass123'
        );
        $user->setPassword($hashedPassword);

        // 3. Lo preparamos para guardar
        $manager->persist($user);

        $clientesDePrueba = [
            // DNI/CIF, Nombre, Email, Teléfono
            ['11111111A', 'Juan de la Palmilla', 'juan@palmilla.com', '600111222'],
            ['B22222222', 'Tech Solutions SL', 'contacto@techsolutions.es', '910222333'],
            ['33333333C', 'El michel', 'el.michel@huertamotril.com', 666666666], 
            ['44444444D', 'Carlos Ruiz', 'carliyos@ruiz.com', '600444555']
        ];

        foreach ($clientesDePrueba as $datos) {
            $cliente = new Cliente();
            $cliente->setDniCif($datos[0]);
            $cliente->setNombreCompleto($datos[1]);
            $cliente->setEmailContacto($datos[2]);
            $cliente->setTelefonoContacto($datos[3]);

            $cliente->setUsuario($user);
            
            // Le decimos a Doctrine que prepare este cliente para guardarlo
            $manager->persist($cliente);
        }

        // 4. Guardamos todo en la base de datos
        $manager->flush();
    }
}
