-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 01, 2026 at 03:51 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tavels_1`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `bookingReference` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `bookingType` enum('flight','hotel','package','car') NOT NULL DEFAULT 'flight',
  `flightId` int(11) DEFAULT NULL,
  `hotelId` int(11) DEFAULT NULL,
  `packageId` int(11) DEFAULT NULL,
  `specialRequests` text DEFAULT NULL,
  `totalPrice` float NOT NULL,
  `status` enum('confirmed','cancelled','pending') DEFAULT 'confirmed',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `carId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `bookingReference`, `userId`, `bookingType`, `flightId`, `hotelId`, `packageId`, `specialRequests`, `totalPrice`, `status`, `createdAt`, `updatedAt`, `carId`) VALUES
(1, 'BKG-1766324975829', 1, 'flight', 1, NULL, NULL, '{\"airline\":\"Air India\",\"flightNumber\":\"AI-2999\",\"route\":\"DEL -> BOM\",\"date\":\"2025-12-21\",\"passengers\":{\"firstName\":\"raja\",\"lastName\":\"paul\",\"email\":\"rajapaul7529@gmail.com\",\"phone\":\"9775845258\",\"passengers\":1}}', 6339, 'confirmed', '2025-12-21 13:49:35', '2025-12-21 13:49:35', NULL),
(2, 'BKG-1766325103199', 1, 'flight', 2, NULL, NULL, '{\"airline\":\"Air India\",\"flightNumber\":\"AI-100\",\"route\":\"HABRA -> DIGHA\",\"date\":\"2025-12-21\",\"passengers\":{\"firstName\":\"raja\",\"lastName\":\"paul\",\"email\":\"rajapaul7529@gmail.com\",\"phone\":\"9775845258\",\"passengers\":1}}', 4050, 'confirmed', '2025-12-21 13:51:43', '2025-12-21 13:51:43', NULL),
(3, 'CAR-1766325346676', 1, 'car', NULL, NULL, NULL, '{\"carName\":\"Honda CR-V\",\"type\":\"SUV\",\"seats\":5,\"transmission\":\"Automatic\",\"pickupLocation\":\"293,Boralia rd, hijalpukuria\",\"dropLocation\":\"near sreenagar joramoth\",\"bookingDate\":\"2025-12-22\",\"pickupTime\":\"23:29\",\"duration\":1,\"passengers\":{\"firstName\":\"raja\",\"lastName\":\"paul\",\"email\":\"rajapaul7529@gmail.com\",\"phone\":\"+919775845258\",\"pickupDate\":\"2025-12-22\",\"pickupTime\":\"23:29\",\"duration\":1,\"pickupLocation\":\"293,Boralia rd, hijalpukuria\",\"dropLocation\":\"near sreenagar joramoth\"}}', 3304, 'confirmed', '2025-12-21 13:55:46', '2025-12-21 13:55:46', 1),
(4, 'BKG-1766326215163', 2, 'flight', 3, NULL, NULL, '{\"airline\":\"British Airways\",\"flightNumber\":\"BA-104\",\"route\":\"JIKHRA -> BANBANIA\",\"date\":\"2025-11-19\",\"passengers\":{\"firstName\":\"avigyan\",\"lastName\":\"debnath\",\"email\":\"nitishpaul7529@gmail.com\",\"phone\":\"9775845258\",\"passengers\":1}}', 6301, 'confirmed', '2025-12-21 14:10:15', '2025-12-21 14:10:15', NULL),
(5, 'BKG-1781273721619', 5, 'flight', 2, NULL, NULL, '{\"airline\":\"Air India\",\"flightNumber\":\"AI-100\",\"route\":\"MALANCHA -> BOM\",\"date\":\"2026-06-16\",\"passengers\":{\"firstName\":\"Rahul\",\"lastName\":\"Das\",\"email\":\"rahul1@gmail.com\",\"phone\":\"7076345550\",\"passengers\":1}}', 5400, 'confirmed', '2026-06-12 14:15:21', '2026-06-12 14:15:21', NULL),
(6, 'BKG-1781273955128', 5, 'flight', 4, NULL, NULL, '{\"airline\":\"IndiGo\",\"flightNumber\":\"6E-101\",\"route\":\"BOM -> DEL\",\"date\":\"2026-06-14\",\"passengers\":{\"firstName\":\"Rahul\",\"lastName\":\"Das\",\"email\":\"rahul1@gmail.com\",\"phone\":\"9809876765\",\"passengers\":1}}', 7250, 'confirmed', '2026-06-12 14:19:15', '2026-06-12 14:19:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL,
  `transmission` enum('manual','automatic') NOT NULL,
  `fuelType` varchar(255) NOT NULL,
  `seats` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `price` float NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `status` enum('available','booked','maintenance') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cars`
--

INSERT INTO `cars` (`id`, `transmission`, `fuelType`, `seats`, `createdAt`, `updatedAt`, `name`, `type`, `price`, `image`, `location`, `status`) VALUES
(1, 'automatic', 'Petrol', 5, '2025-12-21 13:55:46', '2025-12-21 13:55:46', 'Honda CR-V', 'SUV', 3500, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=600&q=80', 'Unknown Location', 'available');

-- --------------------------------------------------------

--
-- Table structure for table `flights`
--

CREATE TABLE `flights` (
  `id` int(11) NOT NULL,
  `flightNumber` varchar(255) NOT NULL,
  `airline` varchar(255) NOT NULL,
  `departureCity` varchar(255) NOT NULL,
  `arrivalCity` varchar(255) NOT NULL,
  `departureDate` date NOT NULL,
  `departureTime` time NOT NULL,
  `arrivalDate` date NOT NULL,
  `arrivalTime` time NOT NULL,
  `duration` varchar(255) NOT NULL,
  `economyPrice` float NOT NULL,
  `status` enum('scheduled','delayed') DEFAULT 'scheduled',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flights`
--

INSERT INTO `flights` (`id`, `flightNumber`, `airline`, `departureCity`, `arrivalCity`, `departureDate`, `departureTime`, `arrivalDate`, `arrivalTime`, `duration`, `economyPrice`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'AI-2999', 'Air India', 'DEL', 'BOM', '2025-12-21', '22:00:00', '2025-12-21', '00:15:00', '2h15m', 6339, 'scheduled', '2025-12-21 13:49:35', '2025-12-21 13:49:35'),
(2, 'AI-100', 'Air India', 'HABRA', 'DIGHA', '2025-12-21', '10:00:00', '2025-12-21', '12:45:00', '2h45m', 4050, 'scheduled', '2025-12-21 13:51:43', '2025-12-21 13:51:43'),
(3, 'BA-104', 'British Airways', 'JIKHRA', 'BANBANIA', '2025-11-19', '10:00:00', '2025-11-19', '12:45:00', '2h45m', 6301, 'scheduled', '2025-12-21 14:10:15', '2025-12-21 14:10:15'),
(4, '6E-101', 'IndiGo', 'BOM', 'DEL', '2026-06-14', '10:00:00', '2026-06-14', '12:45:00', '2h45m', 7250, 'scheduled', '2026-06-12 14:19:15', '2026-06-12 14:19:15');

-- --------------------------------------------------------

--
-- Table structure for table `hotels`
--

CREATE TABLE `hotels` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `pricePerNight` float NOT NULL,
  `rating` float DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` int(11) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `duration` varchar(255) NOT NULL,
  `price` float NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `destination`, `duration`, `price`, `image`, `createdAt`, `updatedAt`, `name`) VALUES
(1, 'Goa', '7 Days', 65899, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(2, 'Delhi', '7 Days', 32786, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(3, 'Kolkata', '7 Days', 20693, 'https://images.unsplash.com/photo-1558431382-27e30314225d?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(4, 'Jaipur', '7 Days', 24958, 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(5, 'Mumbai', '7 Days', 76823, 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(6, 'Jodhpur', '4 Days', 19622, 'https://images.unsplash.com/photo-1534234828563-02597725459b?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(7, 'Ladakh', '7 Days', 24402, 'https://images.unsplash.com/photo-1581793434119-98f0afda66fd?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(8, 'Varanasi', '7 Days', 29921, 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(9, 'Amritsar', '7 Days', 26987, 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(10, 'Rio de Janeiro', '7 Days', 53966, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(11, 'Honolulu', '7 Days', 194656, 'https://images.unsplash.com/photo-1542259548-262138ebdb77?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(12, 'Sydney', '7 Days', 157612, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(13, 'Moorea', '7 Days', 190602, 'https://images.unsplash.com/photo-1532408840135-2b363673b5df?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(14, 'San Diego', '7 Days', 81156, 'https://images.unsplash.com/photo-1503891450247-ee5f8ec46dc3?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(15, 'Antalya', '7 Days', 81383, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(16, 'Tahiti', '7 Days', 181478, 'https://images.unsplash.com/photo-1566375638419-7975871318f7?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(17, 'Melbourne', '7 Days', 87857, 'https://images.unsplash.com/photo-1514395462725-fb4566216a44?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(18, 'Tuscany', '7 Days', 43212, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(19, 'Puglia', '7 Days', 83981, 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(20, 'Hong Kong', '7 Days', 226017, 'https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(21, 'Nadi', '7 Days', 75612, 'https://images.unsplash.com/photo-1544473244-f6895e672d1a?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(22, 'Florianópolis', '7 Days', 80930, 'https://images.unsplash.com/photo-1564052600570-877292276527?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(23, 'Hamilton Island', '7 Days', 189077, 'https://images.unsplash.com/photo-1526958097901-5e6d742d3371?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(24, 'Valencia', '7 Days', 84151, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(25, 'Sicily', '7 Days', 59554, 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(26, 'Crete', '7 Days', 50373, 'https://images.unsplash.com/photo-1515091943-9d5c0ad68ce7?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(27, 'Sardinia', '7 Days', 65626, 'https://images.unsplash.com/photo-1542397284385-6010376c5337?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(28, 'Cebu', '7 Days', 15155, 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(29, 'Los Angeles', '7 Days', 104857, 'https://images.unsplash.com/photo-1503891450247-ee5f8ec46dc3?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(30, 'Athens', '7 Days', 84498, 'https://images.unsplash.com/photo-1505886918845-7e88295f1211?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(31, 'Bridgetown', '7 Days', 75554, 'https://images.unsplash.com/photo-1596203173775-8025287f7d1a?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(32, 'Cartagena', '7 Days', 83403, 'https://images.unsplash.com/photo-1583531352515-d59929848520?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(33, 'Bocas del Toro', '7 Days', 82365, 'https://images.unsplash.com/photo-1518182170546-07fa6dd17491?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(34, 'Zanzibar Town', '7 Days', 54968, 'https://images.unsplash.com/photo-1534764831610-85f269555c8c?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(35, 'Hvar', '7 Days', 75946, 'https://images.unsplash.com/photo-1562681816-6512140402cc?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(36, 'Bora Bora', '7 Days', 149708, 'https://images.unsplash.com/photo-1532408840135-2b363673b5df?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(37, 'Palawan', '7 Days', 28737, 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(38, 'Punta del Este', '7 Days', 59903, 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(39, 'Rarotonga', '7 Days', 60764, 'https://images.unsplash.com/photo-1542259548-262138ebdb77?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(40, 'Santa Marta', '7 Days', 29536, 'https://images.unsplash.com/photo-1534945763267-332306283184?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(41, 'Key West', '4 Days', 248990, 'https://images.unsplash.com/photo-1535443274868-756b0f070b6e?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(42, 'Savusavu', '7 Days', 68127, 'https://images.unsplash.com/photo-1544473244-f6895e672d1a?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', ''),
(43, 'Mexico City', '7 Days', 72357, 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600', '2025-12-21 15:22:35', '2025-12-21 15:22:35', '');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `mobileNumber` varchar(255) DEFAULT NULL,
  `isVerified` tinyint(1) DEFAULT 0,
  `role` enum('user','admin') DEFAULT 'user',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `firstName`, `lastName`, `mobileNumber`, `isVerified`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'rajapaul7529@gmail.com', '$2b$10$GxLRN/vVjicRZHQV6GAseOskrDFi3/Bxt.qWLYS9yln.Y3ilqecc.', 'raja', 'paul', '+919775845258', 1, 'user', '2025-12-21 13:41:14', '2025-12-21 13:41:14'),
(2, 'nitishpaul7529@gmail.com', '$2b$10$NUPw1S4zZh8ZIKr858j4/.OMlI9.CntGFYhugw0n7BcE5VMbi62/u', 'avigyan', 'debnath', '+919775845258', 1, 'admin', '2025-12-21 13:58:44', '2025-12-21 13:58:44'),
(3, 'nitishpaul7528@gmail.com', '$2b$10$1KuuaO3.MA9TUiR6tmvY8.Rs7yhMMvRBTaQWbCzm6f.sT5S1bEOei', 'Nitish', 'Paul', '+919775845258', 1, 'user', '2025-12-21 15:24:52', '2025-12-21 15:24:52'),
(4, 'arpan1@gmail.com', '$2b$10$0e/SLZu0tTKDxSDZO3JBF.vSMIPy4mKpak63XjBVLAlvBj3Ln/Z/u', 'Biplob', 'Das', '+917076342550', 1, 'user', '2026-06-07 19:03:49', '2026-06-07 19:03:49'),
(5, 'rahul1@gmail.com', '$2b$10$Pt1VWAmg6yYkpQpb0J.LYOv.G7LTf99hFjLPRh4rtzyCTpgUPBWPC', 'Rahul', 'Das', '+917076342550', 1, 'user', '2026-06-12 13:33:13', '2026-06-12 13:33:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bookingReference` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_2` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_3` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_4` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_5` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_6` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_7` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_8` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_9` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_10` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_11` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_12` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_13` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_14` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_15` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_16` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_17` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_18` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_19` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_20` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_21` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_22` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_23` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_24` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_25` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_26` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_27` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_28` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_29` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_30` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_31` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_32` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_33` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_34` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_35` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_36` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_37` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_38` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_39` (`bookingReference`),
  ADD UNIQUE KEY `bookingReference_40` (`bookingReference`),
  ADD KEY `userId` (`userId`),
  ADD KEY `flightId` (`flightId`),
  ADD KEY `hotelId` (`hotelId`),
  ADD KEY `packageId` (`packageId`),
  ADD KEY `carId` (`carId`);

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `flights`
--
ALTER TABLE `flights`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `flightNumber` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_2` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_3` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_4` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_5` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_6` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_7` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_8` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_9` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_10` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_11` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_12` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_13` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_14` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_15` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_16` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_17` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_18` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_19` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_20` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_21` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_22` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_23` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_24` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_25` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_26` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_27` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_28` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_29` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_30` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_31` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_32` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_33` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_34` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_35` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_36` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_37` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_38` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_39` (`flightNumber`),
  ADD UNIQUE KEY `flightNumber_40` (`flightNumber`);

--
-- Indexes for table `hotels`
--
ALTER TABLE `hotels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `flights`
--
ALTER TABLE `flights`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `hotels`
--
ALTER TABLE `hotels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `Bookings_carId_foreign_idx` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_10` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_100` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_101` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_102` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_103` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_104` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_105` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_106` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_107` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_108` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_109` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_11` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_110` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_111` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_112` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_113` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_114` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_115` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_116` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_117` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_118` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_119` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_12` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_120` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_121` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_122` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_123` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_124` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_125` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_126` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_127` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_128` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_129` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_13` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_130` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_131` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_132` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_133` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_134` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_135` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_136` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_137` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_138` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_139` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_14` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_140` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_141` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_142` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_143` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_144` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_145` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_146` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_147` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_148` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_149` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_15` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_150` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_151` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_152` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_153` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_154` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_155` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_156` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_157` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_158` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_159` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_16` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_160` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_161` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_162` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_163` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_164` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_165` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_166` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_167` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_168` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_169` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_17` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_170` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_171` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_172` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_173` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_174` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_175` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_176` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_177` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_178` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_179` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_18` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_180` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_181` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_182` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_183` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_184` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_185` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_186` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_187` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_188` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_189` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_19` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_190` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_191` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_192` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_193` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_194` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_195` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_196` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_197` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_198` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_20` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_21` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_22` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_23` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_24` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_25` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_26` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_27` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_28` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_29` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_30` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_31` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_32` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_33` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_34` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_35` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_36` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_37` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_38` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_39` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_40` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_41` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_42` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_43` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_44` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_45` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_46` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_47` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_48` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_49` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_50` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_51` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_52` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_53` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_54` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_55` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_56` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_57` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_58` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_59` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_6` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_60` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_61` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_62` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_63` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_64` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_65` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_66` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_67` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_68` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_69` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_7` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_70` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_71` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_72` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_73` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_74` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_75` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_76` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_77` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_78` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_79` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_8` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_80` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_81` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_82` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_83` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_84` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_85` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_86` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_87` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_88` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_89` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_9` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_90` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_91` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_92` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_93` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_94` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_95` FOREIGN KEY (`flightId`) REFERENCES `flights` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_96` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_97` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_98` FOREIGN KEY (`carId`) REFERENCES `cars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_99` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
