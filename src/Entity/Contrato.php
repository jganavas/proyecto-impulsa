<?php

namespace App\Entity;

use App\Repository\ContratoRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ContratoRepository::class)]
class Contrato
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['cliente:read', 'contrato:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['cliente:read', 'contrato:read'])]
    private ?string $estado = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['cliente:read', 'contrato:read'])]
    private ?\DateTime $fecha_alta = null;

    #[ORM\ManyToOne(inversedBy: 'contratos')]
    #[Groups(['contrato:read'])]
    private ?Cliente $cliente = null;

    #[ORM\ManyToOne(inversedBy: 'contratos')]
    #[Groups(['contrato:read'])]
    private ?Servicio $servicio = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEstado(): ?string
    {
        return $this->estado;
    }

    public function setEstado(string $estado): static
    {
        $this->estado = $estado;

        return $this;
    }

    public function getFechaAlta(): ?\DateTime
    {
        return $this->fecha_alta;
    }

    public function setFechaAlta(\DateTime $fecha_alta): static
    {
        $this->fecha_alta = $fecha_alta;

        return $this;
    }

    public function getCliente(): ?Cliente
    {
        return $this->cliente;
    }

    public function setCliente(?Cliente $cliente): static
    {
        $this->cliente = $cliente;

        return $this;
    }

    public function getServicio(): ?Servicio
    {
        return $this->servicio;
    }

    public function setServicio(?Servicio $servicio): static
    {
        $this->servicio = $servicio;

        return $this;
    }
}
