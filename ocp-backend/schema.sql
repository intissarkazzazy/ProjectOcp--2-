-- Base de données : gestion des moteurs OCP
-- A exécuter une seule fois : mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS ocp_moteurs
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ocp_moteurs;

-- ---------------------------------------------------------------
-- Utilisateurs (les 4 responsables : admin ou visiteur)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilisateurs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nom           VARCHAR(80),
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','visiteur') NOT NULL DEFAULT 'visiteur',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Moteurs
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS moteurs (
  matricule          VARCHAR(50) PRIMARY KEY,
  puissance          VARCHAR(20),
  num_serie          VARCHAR(100),
  marque             VARCHAR(100),
  forme              VARCHAR(20),
  vitesse            VARCHAR(20),
  diametre_arbre     VARCHAR(20),
  entraxe_a          VARCHAR(20),
  entraxe_b          VARCHAR(20),
  dim_p              VARCHAR(20),
  dim_m              VARCHAR(20),
  hauteur_axe        VARCHAR(20),
  localisation       VARCHAR(50),   -- Saake1, Saake2, M.Tekfen, M.Z, ME (ou saisie libre)
  repere_compatible  VARCHAR(150),
  famille            VARCHAR(50),
  equipement         VARCHAR(150),
  etat               ENUM('en_stock','en_revision','en_attente_revision','en_attente_reforme','installe')
                       NOT NULL DEFAULT 'en_stock',
  de_lieu            VARCHAR(50),
  vers_lieu          VARCHAR(50),
  revision_count     INT NOT NULL DEFAULT 0,
  date_ajout         DATE,
  observation        TEXT,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_etat (etat),
  INDEX idx_forme (forme),
  INDEX idx_puissance (puissance),
  INDEX idx_localisation (localisation)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Historique (ajouts, modifications, mouvements, suppressions)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historique (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  matricule  VARCHAR(50) NOT NULL,
  action     ENUM('ajout','modification','mouvement','suppression') NOT NULL,
  details    TEXT,
  date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_matricule (matricule),
  INDEX idx_date (date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Pannes (une ligne casse un moteur -> déclaration + suivi)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pannes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  matricule      VARCHAR(50) NOT NULL,
  ligne          VARCHAR(100),
  description    TEXT,
  moteur_remplacant VARCHAR(50) DEFAULT NULL,
  resolue        TINYINT(1) NOT NULL DEFAULT 0,
  date           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_matricule (matricule)
) ENGINE=InnoDB;

-- Chaque responsable a son propre compte, créé avec :
--   node scripts/creer-utilisateur.js "Nom Prénom" email@ocp.com MotDePasse admin
-- (le mot de passe est haché avant d'être enregistré, jamais en clair ici)
-- ---------------------------------------------------------------
-- Mouvements (journal historique complet, plusieurs lignes par moteur)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mouvements (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  matricule    VARCHAR(50) NOT NULL,
  date         DATE,
  puissance    VARCHAR(20),
  forme        VARCHAR(20),
  marque       VARCHAR(100),
  vitesse      VARCHAR(20),
  de_lieu      VARCHAR(50),
  vers_lieu    VARCHAR(50),
  di           VARCHAR(50),
  ot           VARCHAR(50),
  observation  TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_matricule (matricule),
  INDEX idx_date (date),
  INDEX idx_de (de_lieu),
  INDEX idx_vers (vers_lieu)
) ENGINE=InnoDB;
-- ---------------------------------------------------------------
-- Mouvements (journal historique complet, fichier séparé)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mouvements (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  matricule          VARCHAR(50) NOT NULL,
  date               DATE,
  marque             VARCHAR(100),
  puissance          VARCHAR(20),
  forme              VARCHAR(20),
  etat               VARCHAR(50),
  compteur_revision  INT,
  destination        VARCHAR(50),
  localisation       VARCHAR(50),
  famille            VARCHAR(50),
  entite             VARCHAR(50),
  equipements        VARCHAR(150),
  de_lieu            VARCHAR(50),
  vers_lieu          VARCHAR(50),
  di                 VARCHAR(50),
  ot                 VARCHAR(50),
  avis               VARCHAR(150),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_matricule (matricule),
  INDEX idx_date (date),
  INDEX idx_de (de_lieu),
  INDEX idx_vers (vers_lieu)
) ENGINE=InnoDB;