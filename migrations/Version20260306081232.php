<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260306081232 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cliente ADD usuario_id INT NOT NULL');
        $this->addSql('ALTER TABLE cliente ALTER email_contacto DROP NOT NULL');
        $this->addSql('ALTER TABLE cliente ALTER telefono_contacto DROP NOT NULL');
        $this->addSql('ALTER TABLE cliente ADD CONSTRAINT FK_F41C9B25DB38439E FOREIGN KEY (usuario_id) REFERENCES "user" (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_F41C9B25DB38439E ON cliente (usuario_id)');
        $this->addSql('ALTER TABLE servicio ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE servicio ADD CONSTRAINT FK_CB86F22AA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_CB86F22AA76ED395 ON servicio (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cliente DROP CONSTRAINT FK_F41C9B25DB38439E');
        $this->addSql('DROP INDEX IDX_F41C9B25DB38439E');
        $this->addSql('ALTER TABLE cliente DROP usuario_id');
        $this->addSql('ALTER TABLE cliente ALTER email_contacto SET NOT NULL');
        $this->addSql('ALTER TABLE cliente ALTER telefono_contacto SET NOT NULL');
        $this->addSql('ALTER TABLE servicio DROP CONSTRAINT FK_CB86F22AA76ED395');
        $this->addSql('DROP INDEX IDX_CB86F22AA76ED395');
        $this->addSql('ALTER TABLE servicio DROP user_id');
    }
}
