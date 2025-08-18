-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le :  sam. 03 oct. 2020 à 15:34
-- Version du serveur :  5.7.27-0ubuntu0.16.04.1
-- Version de PHP :  7.0.33-0ubuntu0.16.04.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `mysongs`
--

-- --------------------------------------------------------

--
-- Structure de la table `songs`
--

CREATE TABLE `songs` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `artist` varchar(200) NOT NULL,
  `author` varchar(20) NOT NULL,
  `album` varchar(250) NOT NULL DEFAULT 'unknown',
  `style` varchar(200) NOT NULL,
  `tonality` varchar(5) NOT NULL DEFAULT 'C',
  `signature` varchar(5) NOT NULL DEFAULT '4/4',
  `owner` int(11) NOT NULL DEFAULT '-1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `songs`
--

INSERT INTO `songs` (`id`, `title`, `artist`, `author`, `album`, `style`, `tonality`, `signature`, `owner`) VALUES
(60, '12 bar blues ', 'unknown', 'laloutre', 'unknown', 'Blues', 'C', '4/4', -1),
(76, 'Cantina band', 'Hiromi', 'laloutre', 'unknown', 'Jazz', 'C', '4/4', 1),
(77, 'Hard times', 'Ray Charles', 'laloutre', 'unknown', 'blues', 'Eb', '4/4', 1),
(78, 'Blueberry hill', 'Fats Domino', 'laloutre', 'unknown', 'Blues', 'Eb', '4/4', 1),
(79, 'Oh me', 'Nirvana', 'laloutre', 'Mtv Unplugged', 'Grunge', 'Eb', '4/4', 1),
(80, 'Coffee cold', 'Galt McDermott', 'laloutre', 'unknown', 'Blues Jazz', 'C', '4/4', 1),
(81, 'Raindrop Prelude (Op. 28 No. 15)', 'Chopin', 'laloutre', 'unknown', 'Classical', 'Db', '4/4', 1),
(82, 'Lively up yourself', 'Bob Marley', 'seb', 'unknown', 'unknown', 'G', '4/4', 2),
(83, 'Blue Bossa', 'unknown', 'seb', 'unknown', 'Bossa', 'Cm', '4/4', 2),
(84, 'Montuno', 'unknown', 'seb', 'unknown', 'Montuno', 'Am', '4/4', 2);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `pass` varchar(128) NOT NULL,
  `nick` varchar(128) NOT NULL,
  `folder` varchar(45) NOT NULL DEFAULT 'public',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `email`, `pass`, `nick`, `folder`, `date`) VALUES
(1, 'laloutre12@gmail.com', 'Welcome1', 'laloutre', 'public', '2020-09-09 17:06:50'),
(2, 'sebast.bel@gmail.com', 'Welcome1', 'seb', 'public', '2020-09-23 11:30:50');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `songs`
--
ALTER TABLE `songs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `songs`
--
ALTER TABLE `songs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
