<?php

namespace App\Entity;

use App\Repository\ClienteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ClienteRepository::class)]
class Cliente
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['cliente:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['cliente:read'])]
    #[Assert\NotBlank(message: 'El DNI o CIF es obligatorio.')]
    private ?string $dni_cif = null;

    #[ORM\Column(length: 255)]
    #[Groups(['cliente:read'])]
    #[Assert\NotBlank(message: 'El nombre no puede estar vacío.')]
    #[Assert\Length(min: 3, minMessage: 'El nombre debe tener al menos 3 caracteres.')]
    private ?string $nombre_completo = null;

    #[ORM\Column(length: 255)]
    #[Groups(['cliente:read'])]
    #[Assert\NotBlank(message: 'El email es obligatorio.')]
    #[Assert\Email(message: 'El email proporcionado no es válido.')]
    private ?string $email_contacto = null;

    #[ORM\Column(length: 255)]
    #[Groups(['cliente:read'])]
    #[Assert\Regex(
        pattern: '/^[0-9]{9}$/',
        message: 'El teléfono debe contener exactamente 9 dígitos numéricos.'
    )]
    private ?string $telefono_contacto = null;

    /**
     * @var Collection<int, Contrato>
     */
    #[ORM\OneToMany(targetEntity: Contrato::class, mappedBy: 'cliente')]
    #[Groups(['cliente:read'])]
    private Collection $contratos;

    public function __construct()
    {
        $this->contratos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDniCif(): ?string
    {
        return $this->dni_cif;
    }

    public function setDniCif(string $dni_cif): static
    {
        $this->dni_cif = $dni_cif;

        return $this;
    }

    public function getNombreCompleto(): ?string
    {
        return $this->nombre_completo;
    }

    public function setNombreCompleto(string $nombre_completo): static
    {
        $this->nombre_completo = $nombre_completo;

        return $this;
    }

    public function getEmailContacto(): ?string
    {
        return $this->email_contacto;
    }

    public function setEmailContacto(string $email_contacto): static
    {
        $this->email_contacto = $email_contacto;

        return $this;
    }

    public function getTelefonoContacto(): ?string
    {
        return $this->telefono_contacto;
    }

    public function setTelefonoContacto(string $telefono_contacto): static
    {
        $this->telefono_contacto = $telefono_contacto;

        return $this;
    }

    /**
     * @return Collection<int, Contrato>
     */
    public function getContratos(): Collection
    {
        return $this->contratos;
    }

    public function addContrato(Contrato $contrato): static
    {
        if (!$this->contratos->contains($contrato)) {
            $this->contratos->add($contrato);
            $contrato->setCliente($this);
        }

        return $this;
    }

    public function removeContrato(Contrato $contrato): static
    {
        if ($this->contratos->removeElement($contrato)) {
            // set the owning side to null (unless already changed)
            if ($contrato->getCliente() === $this) {
                $contrato->setCliente(null);
            }
        }

        return $this;
    }
}
