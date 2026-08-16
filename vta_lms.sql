-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 16, 2026 at 07:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vta_lms`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `instructor_id` int(11) NOT NULL,
  `deadline` date DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `module` varchar(255) DEFAULT NULL,
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `batch` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `title`, `course_id`, `instructor_id`, `deadline`, `instructions`, `created_at`, `module`, `start_at`, `end_at`, `file_path`, `file_name`, `batch`) VALUES
(37, 'Assesment 01', 78, 1, NULL, '', '2026-08-12 22:45:47', 'Measurements', '2026-08-11 22:45:00', '2026-08-12 22:45:00', '/uploads/assignments/1786554947228-875411846.pdf', 'CE Assignment AQS_30.pdf', '2026'),
(38, 'Assesment 02', 78, 107, NULL, 'test tes', '2026-08-12 22:49:09', 'Maths', '2026-08-12 22:48:00', '2026-08-13 22:48:00', '/uploads/assignments/1786555149001-338333124.pdf', 'CE Assignment qs-30 final proof.pdf', '2026'),
(39, 'previus', 78, 107, NULL, '', '2026-08-15 12:47:09', 'Measurements', '2026-08-15 12:46:00', '2026-08-15 16:46:00', '/uploads/assignments/1786778229623-522212172.pdf', 'rumais2.pdf', '2020');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('P','A','L') NOT NULL,
  `marked_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `date`, `status`, `marked_by`) VALUES
(3956, 66, '2026-08-12', 'P', 1),
(3957, 67, '2026-08-12', 'P', 1),
(3958, 68, '2026-08-12', 'P', 1),
(3959, 69, '2026-08-12', 'L', 1),
(3960, 70, '2026-08-12', 'P', 1),
(3961, 71, '2026-08-12', 'P', 1),
(3962, 66, '2026-08-11', 'P', 1),
(3963, 67, '2026-08-11', 'P', 1),
(3964, 68, '2026-08-11', 'P', 1),
(3965, 69, '2026-08-11', 'P', 1),
(3966, 70, '2026-08-11', 'P', 1),
(3967, 71, '2026-08-11', 'P', 1),
(3968, 66, '2026-08-10', 'P', 1),
(3969, 67, '2026-08-10', 'P', 1),
(3970, 68, '2026-08-10', 'P', 1),
(3971, 69, '2026-08-10', 'P', 1),
(3972, 70, '2026-08-10', 'P', 1),
(3973, 71, '2026-08-10', 'P', 1),
(3974, 66, '2026-08-09', 'A', 1),
(3975, 67, '2026-08-09', 'P', 1),
(3976, 68, '2026-08-09', 'P', 1),
(3977, 69, '2026-08-09', 'P', 1),
(3978, 70, '2026-08-09', 'P', 1),
(3979, 71, '2026-08-09', 'P', 1),
(3980, 66, '2026-08-08', 'P', 1),
(3981, 67, '2026-08-08', 'P', 1),
(3982, 68, '2026-08-08', 'P', 1),
(3983, 69, '2026-08-08', 'P', 1),
(3984, 70, '2026-08-08', 'P', 1),
(3985, 71, '2026-08-08', 'P', 1),
(3986, 66, '2026-08-06', 'P', 1),
(3987, 67, '2026-08-06', 'P', 1),
(3988, 68, '2026-08-06', 'P', 1),
(3989, 69, '2026-08-06', 'P', 1),
(3990, 70, '2026-08-06', 'P', 1),
(3991, 71, '2026-08-06', 'P', 1),
(3992, 66, '2026-08-07', 'P', 1),
(3993, 67, '2026-08-07', 'P', 1),
(3994, 68, '2026-08-07', 'P', 1),
(3995, 69, '2026-08-07', 'P', 1),
(3996, 70, '2026-08-07', 'P', 1),
(3997, 71, '2026-08-07', 'P', 1),
(3998, 66, '2026-08-05', 'P', 1),
(3999, 67, '2026-08-05', 'P', 1),
(4000, 68, '2026-08-05', 'P', 1),
(4001, 69, '2026-08-05', 'P', 1),
(4002, 70, '2026-08-05', 'P', 1),
(4003, 71, '2026-08-05', 'P', 1),
(4004, 66, '2026-08-04', 'L', 1),
(4005, 67, '2026-08-04', 'P', 1),
(4006, 68, '2026-08-04', 'P', 1),
(4007, 69, '2026-08-04', 'P', 1),
(4008, 70, '2026-08-04', 'P', 1),
(4009, 71, '2026-08-04', 'P', 1),
(4010, 66, '2026-08-02', 'P', 1),
(4011, 67, '2026-08-02', 'P', 1),
(4012, 68, '2026-08-02', 'P', 1),
(4013, 69, '2026-08-02', 'P', 1),
(4014, 70, '2026-08-02', 'P', 1),
(4015, 71, '2026-08-02', 'P', 1),
(4016, 66, '2026-08-01', 'P', 1),
(4017, 67, '2026-08-01', 'P', 1),
(4018, 68, '2026-08-01', 'P', 1),
(4019, 69, '2026-08-01', 'P', 1),
(4020, 70, '2026-08-01', 'P', 1),
(4021, 71, '2026-08-01', 'P', 1),
(4022, 66, '2026-08-03', 'P', 1),
(4023, 67, '2026-08-03', 'P', 1),
(4024, 68, '2026-08-03', 'P', 1),
(4025, 69, '2026-08-03', 'P', 1),
(4026, 70, '2026-08-03', 'P', 1),
(4027, 71, '2026-08-03', 'P', 1),
(4030, 70, '2026-08-13', 'P', 1),
(4031, 69, '2026-08-13', 'L', 1),
(4034, 67, '2026-08-13', 'P', 1),
(4035, 66, '2026-08-13', 'P', 1),
(4036, 67, '2026-08-14', 'P', 1),
(4037, 66, '2026-08-14', 'P', 1),
(4038, 70, '2026-08-14', 'P', 1),
(4039, 69, '2026-08-14', 'P', 1),
(4057, 68, '2026-08-14', 'P', 1),
(4060, 71, '2026-08-14', 'P', 1),
(4067, 66, '2026-07-01', 'P', 1),
(4068, 66, '2026-07-02', 'P', 1),
(4069, 66, '2026-07-03', 'P', 1),
(4070, 66, '2026-07-06', 'P', 1),
(4071, 66, '2026-07-07', 'P', 1),
(4072, 66, '2026-07-08', 'P', 1),
(4074, 66, '2026-07-10', 'P', 1),
(4075, 66, '2026-07-13', 'P', 1),
(4076, 66, '2026-07-14', 'P', 1),
(4077, 66, '2026-07-15', 'P', 1),
(4078, 66, '2026-07-16', 'P', 1),
(4079, 66, '2026-07-17', 'P', 1),
(4080, 66, '2026-07-20', 'P', 1),
(4081, 66, '2026-07-21', 'P', 1),
(4082, 66, '2026-07-22', 'P', 1),
(4083, 66, '2026-07-23', 'P', 1),
(4084, 66, '2026-07-24', 'P', 1),
(4085, 66, '2026-07-27', 'P', 1),
(4086, 66, '2026-07-28', 'P', 1),
(4087, 66, '2026-07-29', 'P', 1),
(4088, 66, '2026-07-30', 'P', 1),
(4089, 66, '2026-07-31', 'P', 1),
(4090, 67, '2026-07-01', 'P', 1),
(4091, 67, '2026-07-02', 'P', 1),
(4092, 67, '2026-07-03', 'P', 1),
(4093, 67, '2026-07-06', 'P', 1),
(4094, 67, '2026-07-07', 'P', 1),
(4095, 67, '2026-07-08', 'P', 1),
(4097, 67, '2026-07-10', 'P', 1),
(4098, 67, '2026-07-13', 'P', 1),
(4099, 67, '2026-07-14', 'P', 1),
(4100, 67, '2026-07-15', 'P', 1),
(4101, 67, '2026-07-16', 'P', 1),
(4102, 67, '2026-07-17', 'P', 1),
(4103, 67, '2026-07-20', 'P', 1),
(4104, 67, '2026-07-21', 'P', 1),
(4105, 67, '2026-07-22', 'P', 1),
(4106, 67, '2026-07-23', 'P', 1),
(4107, 67, '2026-07-24', 'P', 1),
(4108, 67, '2026-07-27', 'P', 1),
(4109, 67, '2026-07-28', 'P', 1),
(4110, 67, '2026-07-29', 'P', 1),
(4111, 67, '2026-07-30', 'P', 1),
(4112, 67, '2026-07-31', 'P', 1),
(4113, 68, '2026-07-01', 'P', 1),
(4114, 68, '2026-07-02', 'P', 1),
(4115, 68, '2026-07-03', 'P', 1),
(4116, 68, '2026-07-06', 'P', 1),
(4117, 68, '2026-07-07', 'P', 1),
(4118, 68, '2026-07-08', 'P', 1),
(4119, 68, '2026-07-09', 'L', 1),
(4120, 68, '2026-07-10', 'P', 1),
(4121, 68, '2026-07-13', 'P', 1),
(4122, 68, '2026-07-14', 'P', 1),
(4123, 68, '2026-07-15', 'P', 1),
(4124, 68, '2026-07-16', 'P', 1),
(4125, 68, '2026-07-17', 'P', 1),
(4126, 68, '2026-07-20', 'P', 1),
(4127, 68, '2026-07-21', 'P', 1),
(4128, 68, '2026-07-22', 'P', 1),
(4129, 68, '2026-07-23', 'P', 1),
(4130, 68, '2026-07-24', 'P', 1),
(4131, 68, '2026-07-27', 'P', 1),
(4132, 68, '2026-07-28', 'P', 1),
(4133, 68, '2026-07-29', 'P', 1),
(4134, 68, '2026-07-30', 'P', 1),
(4135, 68, '2026-07-31', 'P', 1),
(4136, 69, '2026-07-01', 'P', 1),
(4137, 69, '2026-07-02', 'P', 1),
(4138, 69, '2026-07-03', 'P', 1),
(4139, 69, '2026-07-06', 'P', 1),
(4140, 69, '2026-07-07', 'P', 1),
(4141, 69, '2026-07-08', 'P', 1),
(4143, 69, '2026-07-10', 'P', 1),
(4144, 69, '2026-07-13', 'P', 1),
(4145, 69, '2026-07-14', 'P', 1),
(4146, 69, '2026-07-15', 'P', 1),
(4147, 69, '2026-07-16', 'P', 1),
(4148, 69, '2026-07-17', 'P', 1),
(4149, 69, '2026-07-20', 'P', 1),
(4150, 69, '2026-07-21', 'P', 1),
(4151, 69, '2026-07-22', 'P', 1),
(4152, 69, '2026-07-23', 'P', 1),
(4153, 69, '2026-07-24', 'P', 1),
(4154, 69, '2026-07-27', 'P', 1),
(4155, 69, '2026-07-28', 'P', 1),
(4156, 69, '2026-07-29', 'P', 1),
(4157, 69, '2026-07-30', 'P', 1),
(4158, 69, '2026-07-31', 'P', 1),
(4159, 70, '2026-07-01', 'P', 1),
(4160, 70, '2026-07-02', 'P', 1),
(4161, 70, '2026-07-03', 'P', 1),
(4162, 70, '2026-07-06', 'P', 1),
(4163, 70, '2026-07-07', 'P', 1),
(4164, 70, '2026-07-08', 'P', 1),
(4166, 70, '2026-07-10', 'A', 1),
(4167, 70, '2026-07-13', 'P', 1),
(4168, 70, '2026-07-14', 'P', 1),
(4169, 70, '2026-07-15', 'P', 1),
(4170, 70, '2026-07-16', 'P', 1),
(4171, 70, '2026-07-17', 'P', 1),
(4172, 70, '2026-07-20', 'P', 1),
(4173, 70, '2026-07-21', 'P', 1),
(4174, 70, '2026-07-22', 'P', 1),
(4175, 70, '2026-07-23', 'P', 1),
(4176, 70, '2026-07-24', 'P', 1),
(4177, 70, '2026-07-27', 'P', 1),
(4178, 70, '2026-07-28', 'P', 1),
(4179, 70, '2026-07-29', 'P', 1),
(4180, 70, '2026-07-30', 'P', 1),
(4181, 70, '2026-07-31', 'P', 1),
(4182, 71, '2026-07-01', 'P', 1),
(4183, 71, '2026-07-02', 'P', 1),
(4184, 71, '2026-07-03', 'P', 1),
(4185, 71, '2026-07-06', 'P', 1),
(4186, 71, '2026-07-07', 'P', 1),
(4187, 71, '2026-07-08', 'P', 1),
(4188, 71, '2026-07-09', 'L', 1),
(4189, 71, '2026-07-10', 'P', 1),
(4190, 71, '2026-07-13', 'P', 1),
(4191, 71, '2026-07-14', 'P', 1),
(4192, 71, '2026-07-15', 'P', 1),
(4193, 71, '2026-07-16', 'P', 1),
(4194, 71, '2026-07-17', 'P', 1),
(4195, 71, '2026-07-20', 'P', 1),
(4196, 71, '2026-07-21', 'P', 1),
(4197, 71, '2026-07-22', 'P', 1),
(4198, 71, '2026-07-23', 'P', 1),
(4199, 71, '2026-07-24', 'P', 1),
(4200, 71, '2026-07-27', 'P', 1),
(4201, 71, '2026-07-28', 'P', 1),
(4202, 71, '2026-07-29', 'P', 1),
(4203, 71, '2026-07-30', 'P', 1),
(4204, 71, '2026-07-31', 'P', 1);

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `cert_code` varchar(64) NOT NULL,
  `issued_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT 'fa-book-open',
  `lessons` int(11) DEFAULT 10,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `study_mode` varchar(20) NOT NULL DEFAULT 'Full Time',
  `qualification_type` varchar(20) NOT NULL DEFAULT 'NVQ-05',
  `sem1_module` varchar(255) DEFAULT NULL,
  `sem1_code` varchar(50) DEFAULT NULL,
  `sem2_module` varchar(255) DEFAULT NULL,
  `sem2_code` varchar(50) DEFAULT NULL,
  `modules` text DEFAULT NULL,
  `instructor` varchar(255) DEFAULT NULL,
  `sem1_modules` text DEFAULT NULL,
  `sem2_modules` text DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `description`, `icon`, `lessons`, `created_at`, `study_mode`, `qualification_type`, `sem1_module`, `sem1_code`, `sem2_module`, `sem2_code`, `modules`, `instructor`, `sem1_modules`, `sem2_modules`, `duration`, `logo_url`) VALUES
(78, 'Quantity Serveyaer', '', 'fa-book-open', 10, '2026-08-12 22:22:57', 'Full Time', 'NVQ-05', NULL, NULL, NULL, NULL, NULL, 'Ashfan', '[{\"module\":\"Measurements\",\"code\":\"1020\"},{\"module\":\"Maths\",\"code\":\"2050\"}]', '[{\"module\":\"Estimations\",\"code\":\"4050\"},{\"module\":\"Law\",\"code\":\"9020\"}]', 12, '/uploads/courses/1786553577471-858715678.png'),
(79, 'Surveying & Leveling', '', 'fa-book-open', 10, '2026-08-12 22:26:37', 'Part Time', 'Non-NVQ', NULL, NULL, NULL, NULL, '[{\"module\":\"Surveying\",\"code\":\"\"},{\"module\":\"Leveling\",\"code\":\"\"}]', 'Rikkap', NULL, NULL, 6, '/uploads/courses/1786553797116-303449629.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `diary_entries`
--

CREATE TABLE `diary_entries` (
  `id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `week` varchar(50) DEFAULT NULL,
  `month` varchar(50) DEFAULT NULL,
  `slots` text NOT NULL,
  `instructor_remarks` text DEFAULT NULL,
  `to_remarks` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `course_id` int(11) DEFAULT NULL,
  `to_signature` varchar(255) DEFAULT NULL,
  `batch` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `diary_entries`
--

INSERT INTO `diary_entries` (`id`, `instructor_id`, `date`, `week`, `month`, `slots`, `instructor_remarks`, `to_remarks`, `created_at`, `course_id`, `to_signature`, `batch`) VALUES
(2, 1, '2026-07-07', '', 'July', '[{\"time\":\"8.30 AM - 10.30 AM\",\"module\":\"n v\",\"task\":\"cvbf\",\"subject\":\"fvda\",\"signature\":\"\"},{\"time\":\"10.45 AM - 12.15 PM\",\"module\":\"vfdav\",\"task\":\"vfadf\",\"subject\":\"vfa\",\"signature\":\"v\"},{\"time\":\"12.45 PM - 2.45 PM\",\"module\":\"rtrh\",\"task\":\"hsh\",\"subject\":\"hst\",\"signature\":\"\"},{\"time\":\"2.45 PM - 4.45 PM\",\"module\":\"fhh\",\"task\":\"hst\",\"subject\":\"hghsx\",\"signature\":\"\"}]', '', '', '2026-08-08 22:28:39', 13, '', NULL),
(3, 1, '2026-08-08', '', 'August', '[{\"time\":\"8.30 AM - 10.30 AM\",\"module\":\"hth\",\"task\":\"htrh\",\"subject\":\"htrsh\",\"signature\":\"\"},{\"time\":\"10.45 AM - 12.15 PM\",\"module\":\"htrs\",\"task\":\"thsrt\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"12.45 PM - 2.45 PM\",\"module\":\"hts\",\"task\":\"g\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"2.45 PM - 4.45 PM\",\"module\":\"ths\",\"task\":\"asht\",\"subject\":\"\",\"signature\":\"\"}]', '', '', '2026-08-08 22:41:58', 1, '', NULL),
(10, 1, '2026-08-10', '', 'August', '[{\"time\":\"8.30 AM - 10.30 AM\",\"module\":\"estimation\",\"task\":\"\",\"subject\":\"PAGE STRUCTURE — \\\"Instructor\'s Daily Diary\\\" (Portrait A4 layout)\\n\\nPAGE / CONTAINER\\n- Page size: A4 portrait (approx 210mm x 297mm / 8.27in x 11.69in), white background, black text, thin black borders throughout\\n- Page number badge: top-left corner, small rounded box showing \\\"1/5\\\"\\n- All content centered within page margins (~15-20mm on each side)\\n\\nHEADER (centered text, stacked, no box border)\\n- Line 1 (bold, larger, centered): \\\"DVTC - NINTAVUR - 2026 BATCH\\\"\\n- Line 2 (centered, slightly smaller, normal weight): \\\"DIPLOMA IN QUANTITY SURVEYING (NVQ – 05)\\\"\\n\\nMETA ROW (single line, three items spread across full width, small gap below header)\\n- Left: \\\"Date:\\\" label + underlined value (e.g. \\\"03.08.2026\\\")\\n- Center: \\\"Week:\\\" label + blank underline for handwritten/typed entry\\n- Right: \\\"Month:\\\" label + underlined value (e.g. \\\"August\\\")\\n\\nMAIN TABLE (bordered, full width, thin black grid lines)\\nHeader row (light gray/off-white background fill, bold centered text):\\n- Column 1: \\\"TIME\\\"\\n- Column 2: \\\"MODULE\\\"\\n- Column 3: \\\"TASK\\\"\\n- Column 4: \\\"SUBJECT COVERED\\\" (widest column)\\n- Column 5: \\\"INSTRUCTOR SIGNATURE\\\"\\n\\nColumn width ratios (approx, out of full table width):\\n- TIME: ~12%\\n- MODULE: ~14%\\n- TASK: ~10%\\n- SUBJECT COVERED: ~50% (largest)\\n- INSTRUCTOR SIGNATURE: ~14%\\n\\nBLOCK 1 (first table block — 2 rows sharing merged MODULE/TASK cells)\\n- Row 1: TIME = \\\"8.30 AM - 10.30 AM\\\" (text rotated 90°, reads bottom-to-top, vertically centered in cell)\\n- Row 2: TIME = \\\"10.45 AM - 12.15 PM\\\" (also rotated 90°)\\n- MODULE column: single merged cell spanning both rows, rotated 90° text: \\\"Workplace communication management\\\"\\n- TASK column: single merged cell spanning both rows, rotated 90° text: \\\"Basic communication\\\"\\n- SUBJECT COVERED column: NOT merged — each row has its own independent multi-line text area\\n  - Row 1 text content: paragraph-style list of topics with blank line spacing between each topic (e.g. \\\"Basic communication models...\\\", blank line, \\\"Introduction to Communication\\\", blank line, \\\"Why we use communication\\\", blank line, \\\"Use Communication in workplace\\\")\\n  - Row 2 text content: a heading line (\\\"Channels of communications\\\") followed by a numbered sub-list (1. Oral Channel, 2. Written channel, 3. Visual channel), with extra blank vertical space filling remainder of cell\\n- INSTRUCTOR SIGNATURE column: merged or per-row empty cells, blank (for handwritten signature)\\n- Row heights: tall enough to fit multi-line text comfortably (this block is visually the tallest part of the page)\\n\\nLUNCH DIVIDER ROW\\n- Full-width row, no vertical borders, centered bold text: \\\"Lunch Time: 12.15 PM - 12.45 PM\\\"\\n- Sits between Block 1 and Block 2, acts as a section break (has visual gap/margin above and below, separate from table borders)\\n\\nBLOCK 2 (second table block — same 5-column structure, own bordered table, 2 rows)\\n- Row 1: TIME = \\\"12.45 PM - 2.45 PM\\\" (rotated 90°)\\n- Row 2: TIME = \\\"2.45 PM - 4.45 PM\\\" (rotated 90°)\\n- MODULE column: merged cell spanning both rows, rotated 90° text: \\\"English\\\" (in this example, mostly empty/short)\\n- TASK column: merged cell spanning both rows, blank\\n- SUBJECT COVERED column: blank cells (empty, ready for input), each row separate\\n- INSTRUCTOR SIGNATURE column: blank cells\\n- Row heights: similarly tall, roughly matching Block 1\'s row heights for visual consistency\\n\\nFOOTER (below table, left-aligned, stacked lines, small gap between each)\\n- \\\"Instructor Remarks:\\\" + long underline extending to right margin\\n- \\\"T/O Remarks\\\" + colon aligned with above label + underline extending to right margin\\n- \\\"T/O Signature\\\" + colon aligned + underline extending to right margin\\n\\nGENERAL STYLING NOTES FOR AI AGENT\\n- Use serif font (Times New Roman style) throughout to match academic/formal document look\\n- All table borders: thin solid black lines, no rounded corners\\n- TIME/MODULE/TASK column text: rotated -90° (vertical, reading bottom to top), vertically and horizontally centered within their cell\\n- SUBJECT COVERED text: left-aligned, normal horizontal orientation, generous line-height for readability\\n- Two separate table blocks (not one continuous table) — visually distinct with the Lunch row as a non-table divider between them\\n- This appears to be page \\\"1/5\\\" — structure implies multiple diary pages/days can exist in a set, so consider pagination or multi-day entries in the underlying data model\\n- Should render properly for both on-screen editing (form inputs) and print/PDF export (static text) — likely need two render modes: \\\"edit\\\" (inputs/textareas replacing text) and \\\"print\\\" (final styled output matching this exact look)\",\"signature\":\"\"},{\"time\":\"10.45 AM - 12.15 PM\",\"module\":\"estimation\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"12.45 PM - 2.45 PM\",\"module\":\"estimation\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"2.45 PM - 4.45 PM\",\"module\":\"estimation\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"}]', '', '', '2026-08-10 20:46:41', 13, '', NULL),
(11, 1, '2026-08-10', '', 'August', '[{\"time\":\"8.30 AM - 10.30 AM\",\"module\":\"TEST a\",\"task\":\"\",\"subject\":\"Nan test paren\",\"signature\":\"\"},{\"time\":\"10.45 AM - 12.15 PM\",\"module\":\"TEST a\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"12.45 PM - 2.45 PM\",\"module\":\"Test b\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"2.45 PM - 4.45 PM\",\"module\":\"Test b\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"}]', '', '', '2026-08-10 21:34:12', 65, '', NULL),
(12, 1, '2026-08-12', '', 'August', '[{\"time\":\"8.30 AM - 10.30 AM\",\"module\":\"Maths\",\"task\":\"Naaa cover it\",\"subject\":\"Naan cover it \\nnaan also cover this \\nalsopn huinukn\\nknnvn\\nvnfnov\\nhbbvubuv\",\"signature\":\"\"},{\"time\":\"10.45 AM - 12.15 PM\",\"module\":\"Maths\",\"task\":\"Naaa cover it\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"12.45 PM - 2.45 PM\",\"module\":\"\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"2.45 PM - 4.45 PM\",\"module\":\"\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"}]', '', '', '2026-08-12 23:13:15', 78, '', NULL),
(13, 1, '2026-08-15', '', 'August', '[{\"time\":\"8.30 AM - 10.30 AM\",\"module\":\"Maths\",\"task\":\"Daily Diary\\nDVTC · Nintavur\",\"subject\":\"writing-mode: vertical-rl; /* text flows top-to-bottom */\\n  text-orientation: mixed;\\n  white-space: nowrap;\",\"signature\":\"\"},{\"time\":\"10.45 AM - 12.15 PM\",\"module\":\"Maths\",\"task\":\"Daily Diary\\nDVTC · Nintavur\",\"subject\":\"writing-mode: vertical-rl; /* text flows top-to-bottom */\\n  text-orientation: mixed;\\n  white-space: nowrap;\",\"signature\":\"\"},{\"time\":\"12.45 PM - 2.45 PM\",\"module\":\"Estimations\",\"task\":\"Print / Export PDF\",\"subject\":\"writing-mode: vertical-rl; /* text flows top-to-bottom */\\n  text-orientation: mixed;\\n  white-space: nowrap;\",\"signature\":\"\"},{\"time\":\"2.45 PM - 4.15 PM\",\"module\":\"Estimations\",\"task\":\"Print / Export PDF\",\"subject\":\"writing-mode: vertical-rl; /* text flows top-to-bottom */\\n  text-orientation: mixed;\\n  white-space: nowrap;\",\"signature\":\"\"}]', '.diary-footer', '.diary-footer', '2026-08-15 14:50:56', 78, '.diary-footer', '2026'),
(15, 1, '2026-08-15', '', 'August', '[{\"time\":\"8.30 AM - 10.30 AM\",\"module\":\"Leveling\",\"task\":\"tygh67\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"10.45 AM - 12.15 PM\",\"module\":\"Leveling\",\"task\":\"tygh67\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"12.45 PM - 2.45 PM\",\"module\":\"\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"2.45 PM - 4.15 PM\",\"module\":\"\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"}]', '', '', '2026-08-15 16:36:30', 79, '', '2026'),
(16, 1, '2026-08-16', '', 'August', '[{\"time\":\"8.30 AM - 10.30 AM\",\"module\":\"Maths\",\"task\":\"test\",\"subject\":\"gthtrsht\",\"signature\":\"\"},{\"time\":\"10.45 AM - 12.15 PM\",\"module\":\"Maths\",\"task\":\"test\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"12.45 PM - 2.45 PM\",\"module\":\"\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"},{\"time\":\"2.45 PM - 4.15 PM\",\"module\":\"\",\"task\":\"\",\"subject\":\"\",\"signature\":\"\"}]', '', '', '2026-08-15 16:42:41', 78, '', '2026');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `enrolled_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `progress`, `enrolled_at`) VALUES
(56, 101, 78, 0, '2026-08-12 22:34:35'),
(57, 102, 78, 0, '2026-08-12 22:36:35'),
(58, 103, 78, 0, '2026-08-12 22:37:36'),
(59, 104, 79, 0, '2026-08-12 22:38:46'),
(60, 105, 79, 0, '2026-08-12 22:39:29'),
(61, 106, 78, 0, '2026-08-12 22:39:54');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `incharge` varchar(255) DEFAULT NULL,
  `event_at` datetime DEFAULT NULL,
  `pdf_path` varchar(500) DEFAULT NULL,
  `pdf_name` varchar(255) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `name`, `location`, `incharge`, `event_at`, `pdf_path`, `pdf_name`, `created_by`, `created_at`) VALUES
(2, 'test een', 'dc', 'cdc', '2026-08-09 17:09:00', '/uploads/events/1786275595812-836916552.pdf', 'MODULE CODE DA 122.pdf', 1, '2026-08-09 17:09:56');

-- --------------------------------------------------------

--
-- Table structure for table `event_photos`
--

CREATE TABLE `event_photos` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `photo_path` varchar(500) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_photos`
--

INSERT INTO `event_photos` (`id`, `event_id`, `photo_path`, `created_at`) VALUES
(3, 2, '/uploads/events/1786275595964-189387852.png', '2026-08-09 17:09:56'),
(4, 2, '/uploads/events/1786275596336-187399243.png', '2026-08-09 17:09:56'),
(5, 2, '/uploads/events/1786275596336-122228742.png', '2026-08-09 17:09:56'),
(6, 2, '/uploads/events/1786275596468-940202206.png', '2026-08-09 17:09:56'),
(7, 2, '/uploads/events/1786275596472-787506598.png', '2026-08-09 17:09:56'),
(8, 2, '/uploads/events/1786275596473-297033007.jpg', '2026-08-09 17:09:56');

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `module` varchar(255) DEFAULT NULL,
  `instructor_id` int(11) NOT NULL,
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `batch` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`id`, `title`, `course_id`, `module`, `instructor_id`, `start_at`, `end_at`, `created_at`, `batch`) VALUES
(17, 'Exam 01', 78, 'Measurements', 1, '2026-08-10 22:46:00', '2026-08-12 22:46:00', '2026-08-12 22:46:18', '2026'),
(18, 'Exam 02', 78, 'Measurements', 107, '2026-08-12 22:49:00', '2026-08-13 22:49:00', '2026-08-12 22:49:43', '2026'),
(19, 'previus exam', 78, 'Maths', 107, '2026-08-15 12:47:00', '2026-08-15 12:50:00', '2026-08-15 12:48:11', '2026'),
(20, 'previus exam 2', 78, 'Measurements', 107, '2026-08-15 12:48:00', '2026-08-15 12:50:00', '2026-08-15 12:48:35', '2020');

-- --------------------------------------------------------

--
-- Table structure for table `exam_submissions`
--

CREATE TABLE `exam_submissions` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `student_user_id` int(11) NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `grade` varchar(20) DEFAULT NULL,
  `feedback` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forum_replies`
--

CREATE TABLE `forum_replies` (
  `id` int(11) NOT NULL,
  `thread_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `forum_replies`
--

INSERT INTO `forum_replies` (`id`, `thread_id`, `author_id`, `body`, `created_at`) VALUES
(1, 1, 3, 'A reply', '2026-08-08 16:15:57');

-- --------------------------------------------------------

--
-- Table structure for table `forum_threads`
--

CREATE TABLE `forum_threads` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text DEFAULT NULL,
  `author_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `forum_threads`
--

INSERT INTO `forum_threads` (`id`, `title`, `body`, `author_id`, `created_at`) VALUES
(1, 'Test thread', 'Hello', 3, '2026-08-08 16:15:57'),
(4, 'test', 'amomopmmpfrkggt', 1, '2026-08-09 16:43:33');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('Internship','Vacancy') NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `closes_at` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `posted_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `title`, `type`, `location`, `closes_at`, `description`, `posted_by`, `created_at`) VALUES
(1, 'Junior Quantity Surveyor', 'Internship', 'Colombo', '2026-08-30', 'Entry-level QS internship for NVQ students.', 2, '2026-08-08 16:13:04'),
(2, 'Assistant Quantity Surveyor', 'Vacancy', 'Ampara', NULL, 'Diploma/NVQ welcome.', 2, '2026-08-08 16:13:04');

-- --------------------------------------------------------

--
-- Table structure for table `lecturers`
--

CREATE TABLE `lecturers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `lecturer_id` varchar(50) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `modules` text DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lecturers`
--

INSERT INTO `lecturers` (`id`, `user_id`, `name`, `lecturer_id`, `course_id`, `modules`, `photo_url`, `created_at`) VALUES
(53, 107, 'Ashfan', 'LEC-01', 78, '[{\"module\":\"Measurements\",\"code\":\"1020\"},{\"module\":\"Maths\",\"code\":\"2050\"}]', NULL, '2026-08-12 22:40:55'),
(54, 108, 'Christo', 'LEC-02', 78, '[{\"module\":\"Estimations\",\"code\":\"4050\"},{\"module\":\"Law\",\"code\":\"9020\"}]', NULL, '2026-08-12 22:41:50'),
(55, 109, 'Rasaath', 'LEC-03', 79, '[{\"module\":\"Surveying\",\"code\":\"\"}]', NULL, '2026-08-12 22:42:28');

-- --------------------------------------------------------

--
-- Table structure for table `lectures`
--

CREATE TABLE `lectures` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `id` int(11) NOT NULL,
  `type` enum('notes','past_paper') NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `module` varchar(255) DEFAULT NULL,
  `unit_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resources`
--

INSERT INTO `resources` (`id`, `type`, `course_id`, `module`, `unit_name`, `file_path`, `file_name`, `uploaded_by`, `created_at`) VALUES
(4, 'notes', NULL, 'maths', 'trictometry', '/uploads/resources/1786268747072-638099731.pdf', 'Copy of Sumaith_Attendance_Assessment-1(1).pdf', 1, '2026-08-09 15:15:47'),
(5, 'past_paper', NULL, 'measurement', 'brick', '/uploads/resources/1786268778426-970886532.pdf', 'paperknife-split.pdf(1).pdf', 1, '2026-08-09 15:16:18'),
(8, 'notes', NULL, 'TEST c', 'maiin', '/uploads/resources/1786383747730-24390671.pdf', 'Literature_Review_Lotus_Tower (2).pdf', 76, '2026-08-10 23:12:27'),
(9, 'past_paper', NULL, 'TEST c', '2026', '/uploads/resources/1786383767538-656277526.pdf', 'Attendance -2026.pdf', 76, '2026-08-10 23:12:47');

-- --------------------------------------------------------

--
-- Table structure for table `results`
--

CREATE TABLE `results` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `measurement` int(11) DEFAULT 0,
  `estimation` int(11) DEFAULT 0,
  `contracts` int(11) DEFAULT 0,
  `cad` int(11) DEFAULT 0,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `nic` varchar(50) DEFAULT NULL,
  `batch` varchar(50) NOT NULL DEFAULT 'NVQ-5',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_no` varchar(50) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `name`, `nic`, `batch`, `created_at`, `mis_no`, `photo_url`) VALUES
(66, 101, 'Mohamed Rikkap', '215215741513', '2026', '2026-08-12 22:34:35', 'JG/L5_V1/01/0014', '/uploads/students/1786554275718-986912513.png'),
(67, 102, 'Mohamed Sumaith', '215215741514', '2026', '2026-08-12 22:36:35', 'JG/L5_V1/01/0013', '/uploads/students/1786554395798-459663397.jpg'),
(68, 103, 'M.T.M. Aflal Mifly', '200011122233', '2020', '2026-08-12 22:37:36', 'JG/L5_V1/01/0012', '/uploads/students/1786554456256-266210890.jpg'),
(69, 104, 'L1student', '2152157415142', '2026', '2026-08-12 22:38:46', 'JG/L5_V1/01/001', NULL),
(70, 105, 'L2student', '21521574152', '2026', '2026-08-12 22:39:29', 'JG/L5_V1/01/002', NULL),
(71, 106, 'L3student', '21521574151', '2020', '2026-08-12 22:39:54', 'JG/L5_V1/01/003', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `student_user_id` int(11) NOT NULL,
  `note` text DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `grade` varchar(20) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`id`, `assignment_id`, `student_user_id`, `note`, `submitted_at`, `grade`, `feedback`, `file_path`, `file_name`) VALUES
(19, 38, 101, '', '2026-08-12 22:57:23', '100', NULL, '/uploads/submissions/1786555643189-365634432.jpg', 'ChatGPT Image Aug 11, 2026, 01_52_40 PM.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `timetables`
--

CREATE TABLE `timetables` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `schedule` text NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timetables`
--

INSERT INTO `timetables` (`id`, `course_id`, `schedule`, `updated_by`, `updated_at`) VALUES
(4, 78, '{\"monday\":[\"Measurements\",\"Measurements\",\"Estimations\",\"Estimations\"],\"tuesday\":[\"Measurements\",\"Maths\",\"Maths\",\"Estimations\"],\"wednesday\":[\"Measurements\",\"Maths\",\"Estimations\",\"Measurements\"],\"thursday\":[\"Maths\",\"Estimations\",\"Estimations\",\"Measurements\"],\"friday\":[\"Maths\",\"Law\",\"Estimations\",\"Measurements\"]}', 1, '2026-08-15 12:26:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','instructor','admin') NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `created_at`) VALUES
(1, 'Admin User', 'admin@vta.lk', '$2a$10$bTj.f9V.PQ6QAYdK0RjnIOcnNmAHRhZCwf4IihoZmK9JZ7cijaQdS', 'admin', NULL, '2026-08-08 16:13:04'),
(2, 'QS Instructor', 'instructor@vta.lk', '$2a$10$bTj.f9V.PQ6QAYdK0RjnIOcnNmAHRhZCwf4IihoZmK9JZ7cijaQdS', 'instructor', NULL, '2026-08-08 16:13:04'),
(3, 'Demo Student', 'student@vta.lk', '$2a$10$bTj.f9V.PQ6QAYdK0RjnIOcnNmAHRhZCwf4IihoZmK9JZ7cijaQdS', 'student', NULL, '2026-08-08 16:13:04'),
(4, 'Test Student Full', 'teststudent@vta.lk', '$2a$10$JgEUnw8La3sItxFGcBC44.7fjd3mpuLRqG8M.Yr2J9DNcoGUfTkw.', 'student', NULL, '2026-08-08 16:54:54'),
(5, 'Photo Test Student', 'phototest@vta.lk', '$2a$10$YAD6l.kSh.GoO0UH7reP4e51BhUJd5XvJbqDjwdoHtZCP39Rh/rVe', 'student', NULL, '2026-08-08 16:55:26'),
(6, 'test rikap', 'rikkap', '$2a$10$a7Qs6nqs2DbSOqwlbiB7HeddDW3MkcDKUIRkXI5DdvCYX1iAAy29O', 'student', NULL, '2026-08-08 17:59:39'),
(8, 'RIKKAP', 'lecture', '$2a$10$J5Xg4ORLWWOIkjTNZaRAGO5TXOZSIUPe7Uszix6uG1X5YH9eq/Wz6', 'instructor', NULL, '2026-08-08 19:05:03'),
(12, 'M.T.M. Aflal Mifly', 'm.t.m. aflal mifly', '$2a$10$LkiTfjY/RDzHaJlScU.gquQq5HJN8tai2XpjGU0uiblU5LGvGcvGq', 'student', NULL, '2026-08-09 00:15:49'),
(14, 'test lec', 'testlec', '$2a$10$r3TyfzGbuJyk0uEp.aTpIuO22gyXZVM719RkOb0i3ZyptlG8IVOdO', 'instructor', NULL, '2026-08-09 11:34:42'),
(28, 'test lec2', 'testlec2', '$2a$10$fmq8OgTn7sooKRCH8w71pebwK69Na.jpnE1d9TEDAlNgLmyYyzwIu', 'instructor', NULL, '2026-08-09 19:19:59'),
(33, 'test lec3', 'test lec3', '$2a$10$ggpeZzPvfCXesjLNPjOKp.9iEuRj5S0Pa5g5iBEViuWW8pAKz8yPS', 'instructor', NULL, '2026-08-09 19:39:17'),
(35, 'me', 'me', '$2a$10$62fhYHVviPkbBPmKH3.X7.GXXWrNNHo.nAHevDTr.HueSUykVmPWm', 'instructor', NULL, '2026-08-09 19:47:30'),
(74, 'Final student', 'final111', '$2a$10$rmuHcoKaOgS8.mCOOmS15.nnXrwK3JYm9oZLfJVEOhpXKAqqcH3i2', 'student', NULL, '2026-08-10 21:32:29'),
(75, 'Finsl 111', 'final1111', '$2a$10$muYDqKc4nLlVDIuJc/mFyOD6j/vp8eQNNdMKL8B/XQc.RVJ0y5c4.', 'instructor', NULL, '2026-08-10 21:33:07'),
(76, 'Final lec', 'final lec', '$2a$10$Ba2KGHxcZQj4tdzEpoh4U.DAMslQ34eKKzwAfNLZ0OYdSJVx0J9UC', 'instructor', NULL, '2026-08-10 21:39:02'),
(101, 'Mohamed Rikkap', 'rikkap@vtasl.com', '$2a$10$R1dNIdiZpPAcF6UoThLWz.COwNMqUNhwhela51LAMO9T0ZdBhcKT.', 'student', NULL, '2026-08-12 22:34:35'),
(102, 'Mohamed Sumaith', 'sumaith@vtasl.com', '$2a$10$TezJY2JklykOC.jcWO.4xOa/9R9dZwSX5rM37tqDWcbrMlApXDbDK', 'student', NULL, '2026-08-12 22:36:35'),
(103, 'M.T.M. Aflal Mifly', 'mifly@vtasl.com', '$2a$10$SYip2xb9nj5IEzVpSDHtp.ei/9qDkO.0TkQ.E6AdOJSwCqmodXE4S', 'student', NULL, '2026-08-12 22:37:36'),
(104, 'L1student', 'l1student', '$2a$10$4Pb7uEOcsQRgZaHmry2yw.ltXGWJRqz3o7IDiuepPL5ewjopuuTLS', 'student', NULL, '2026-08-12 22:38:46'),
(105, 'L2student', 'l2student', '$2a$10$0PxcJGMsAX8ir3nIYPKKd.1V8uDwn2qJK1lGpS7/SCO.FVI0h/zIW', 'student', NULL, '2026-08-12 22:39:29'),
(106, 'L3student', 'l3student', '$2a$10$g7mJvg1sv6tDAKG2rosLhenh6R8xLljSCzUGodKnz3CSocHuzVfne', 'student', NULL, '2026-08-12 22:39:54'),
(107, 'Ashfan', 'ashfan', '$2a$10$L9UJEo8bMTINROI3PXU2yu4wpmcxn9l4ErnZNQ8/kp3t7YmP7Xsh6', 'instructor', NULL, '2026-08-12 22:40:55'),
(108, 'Christo', 'christo', '$2a$10$6YHTZtJeLg4MEPGX03a/o.LNaaCqSGa.HCB7vXH1aEOsoMSc1uvou', 'instructor', NULL, '2026-08-12 22:41:50'),
(109, 'Rasaath', 'rasaath', '$2a$10$hd/WW45tAuDpqZTBBTwthe6HKI7W8Azm9DOwioyo.gPzcSajz3eFe', 'instructor', NULL, '2026-08-12 22:42:28'),
(120, 'test admin', 'test admin', '$2a$10$TUuLuTZigTyDbIGOTIsXWOti6Uhx5ubNbC2rbNBfGMorNfWwA43pm', 'admin', NULL, '2026-08-15 13:38:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_attendance` (`student_id`,`date`),
  ADD KEY `marked_by` (`marked_by`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cert_code` (`cert_code`),
  ADD UNIQUE KEY `uq_certificate` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `diary_entries`
--
ALTER TABLE `diary_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_enrollment` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `event_photos`
--
ALTER TABLE `event_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indexes for table `exam_submissions`
--
ALTER TABLE `exam_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_exam_submission` (`exam_id`,`student_user_id`),
  ADD KEY `student_user_id` (`student_user_id`);

--
-- Indexes for table `forum_replies`
--
ALTER TABLE `forum_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `thread_id` (`thread_id`),
  ADD KEY `author_id` (`author_id`);

--
-- Indexes for table `forum_threads`
--
ALTER TABLE `forum_threads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author_id` (`author_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `posted_by` (`posted_by`);

--
-- Indexes for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `lectures`
--
ALTER TABLE `lectures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `results`
--
ALTER TABLE `results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_submission` (`assignment_id`,`student_user_id`),
  ADD KEY `student_user_id` (`student_user_id`);

--
-- Indexes for table `timetables`
--
ALTER TABLE `timetables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_id` (`course_id`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4212;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `diary_entries`
--
ALTER TABLE `diary_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `event_photos`
--
ALTER TABLE `event_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `exam_submissions`
--
ALTER TABLE `exam_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `forum_replies`
--
ALTER TABLE `forum_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `forum_threads`
--
ALTER TABLE `forum_threads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lecturers`
--
ALTER TABLE `lecturers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `lectures`
--
ALTER TABLE `lectures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `results`
--
ALTER TABLE `results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `timetables`
--
ALTER TABLE `timetables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `diary_entries`
--
ALTER TABLE `diary_entries`
  ADD CONSTRAINT `diary_entries_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_photos`
--
ALTER TABLE `event_photos`
  ADD CONSTRAINT `event_photos_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_submissions`
--
ALTER TABLE `exam_submissions`
  ADD CONSTRAINT `exam_submissions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_submissions_ibfk_2` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `forum_replies`
--
ALTER TABLE `forum_replies`
  ADD CONSTRAINT `forum_replies_ibfk_1` FOREIGN KEY (`thread_id`) REFERENCES `forum_threads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forum_replies_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `forum_threads`
--
ALTER TABLE `forum_threads`
  ADD CONSTRAINT `forum_threads_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD CONSTRAINT `lecturers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lecturers_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lectures`
--
ALTER TABLE `lectures`
  ADD CONSTRAINT `lectures_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lectures_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `resources`
--
ALTER TABLE `resources`
  ADD CONSTRAINT `resources_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `resources_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `results`
--
ALTER TABLE `results`
  ADD CONSTRAINT `results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timetables`
--
ALTER TABLE `timetables`
  ADD CONSTRAINT `timetables_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetables_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
