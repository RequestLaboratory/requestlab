CREATE DATABASE  IF NOT EXISTS `mobileone_ecg` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mobileone_ecg`;
-- MySQL dump 10.13  Distrib 8.0.41, for macos15 (x86_64)
--
-- Host: localhost    Database: mobileone_ecg
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__centermonthlyplans`
--

DROP TABLE IF EXISTS `__centermonthlyplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__centermonthlyplans` (
  `rangestart` date DEFAULT NULL,
  `centerid` int NOT NULL DEFAULT '0',
  `quantity` decimal(32,0) DEFAULT NULL,
  `planvalue` decimal(42,0) DEFAULT NULL,
  `ARPU` decimal(46,4) DEFAULT NULL,
  `segment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `__timerange`
--

DROP TABLE IF EXISTS `__timerange`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__timerange` (
  `month` int NOT NULL,
  `year` int NOT NULL,
  `rangestart` datetime NOT NULL,
  KEY `ix_month_tr` (`month`),
  KEY `ix_year_tr` (`year`),
  KEY `ix_date_tr` (`rangestart`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_ageingreports`
--

DROP TABLE IF EXISTS `_ageingreports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_ageingreports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `data` text,
  `description` varchar(150) DEFAULT NULL,
  `reportName` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_centermonthlyplans`
--

DROP TABLE IF EXISTS `_centermonthlyplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_centermonthlyplans` (
  `rangestart` date DEFAULT NULL,
  `centerid` int NOT NULL DEFAULT '0',
  `centername` varchar(255) DEFAULT NULL,
  `quantity` decimal(32,0) DEFAULT NULL,
  `planvalue` decimal(42,0) DEFAULT NULL,
  `ARPU` decimal(46,4) DEFAULT NULL,
  `segment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_centerstats`
--

DROP TABLE IF EXISTS `_centerstats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_centerstats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerid` int NOT NULL,
  `feedback` varchar(20) DEFAULT NULL,
  `allEcgUsage` varchar(20) DEFAULT NULL,
  `criticalEcgUsage` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centerid` (`centerid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `additional_bill`
--

DROP TABLE IF EXISTS `additional_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `additional_bill` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerid` varchar(100) DEFAULT NULL,
  `item` varchar(30) DEFAULT NULL,
  `amount` varchar(100) DEFAULT NULL,
  `additionalData` json DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adminusers`
--

DROP TABLE IF EXISTS `adminusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adminusers` (
  `email` varchar(100) NOT NULL DEFAULT '',
  `name` varchar(100) DEFAULT NULL,
  `photo` varchar(200) DEFAULT NULL,
  `role` varchar(250) DEFAULT NULL,
  `permissions` varchar(500) DEFAULT NULL,
  `refreshToken` varchar(100) DEFAULT NULL,
  `jiraId` varchar(50) DEFAULT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `lsqUserId` varchar(50) DEFAULT NULL,
  `preferredLandingPageUrl` varchar(400) DEFAULT NULL,
  `IPPXid` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `deletedAt` datetime DEFAULT NULL,
  `last_modified_on` datetime DEFAULT NULL,
  `last_modified_by` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ai_integration`
--

DROP TABLE IF EXISTS `ai_integration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_integration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(100) DEFAULT NULL,
  `client` varchar(30) DEFAULT NULL,
  `apiType` varchar(30) DEFAULT NULL,
  `apiTypevalue` varchar(100) DEFAULT NULL,
  `response` json DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `apiCallCount` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_ecgid` (`ecgId`),
  KEY `ai_ecgid_client_id` (`ecgId`,`client`,`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1857 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auditlogs`
--

DROP TABLE IF EXISTS `auditlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditlogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jsonData` longtext,
  `centerId` varchar(20) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_auditlogs_centerId` (`centerId`)
) ENGINE=InnoDB AUTO_INCREMENT=11810 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `billing`
--

DROP TABLE IF EXISTS `billing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `CenterId` int NOT NULL,
  `PdfId` varchar(50) NOT NULL,
  `Month` int NOT NULL,
  `Year` int NOT NULL,
  `Date` datetime NOT NULL,
  `Data` longtext NOT NULL,
  `qbid` varchar(100) DEFAULT NULL,
  `isHub` int DEFAULT NULL,
  `syncToken` varchar(50) DEFAULT NULL,
  `invoiceId` int DEFAULT NULL,
  `quickbookResponse` longtext,
  PRIMARY KEY (`Id`),
  KEY `idx_billing_CenterId` (`CenterId`),
  KEY `idx_billing_qbid` (`qbid`),
  KEY `idx_billing_invoiceId` (`invoiceId`),
  KEY `idx_billing_isHub` (`isHub`),
  KEY `idx_billing_PdfId` (`PdfId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `billingconfig`
--

DROP TABLE IF EXISTS `billingconfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billingconfig` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `billPlan` varchar(500) DEFAULT NULL,
  `basePlan` int DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `spokeCenterId` int DEFAULT NULL,
  `prepaid` int DEFAULT '0',
  `billcategory` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `billingplans`
--

DROP TABLE IF EXISTS `billingplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billingplans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `billPlan` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `billplan`
--

DROP TABLE IF EXISTS `billplan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billplan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `prepaid` int DEFAULT '0',
  `maximumEcgs` int DEFAULT NULL,
  `exceedingEcgCost` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_centerId` (`centerId`)
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `billplanitem`
--

DROP TABLE IF EXISTS `billplanitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billplanitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `billingId` int DEFAULT NULL,
  `item` varchar(30) DEFAULT NULL,
  `rate` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `billproducts`
--

DROP TABLE IF EXISTS `billproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billproducts` (
  `id` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `qbCode` varchar(50) DEFAULT NULL,
  `qbdomain` int DEFAULT NULL,
  `igstCode` varchar(10) DEFAULT NULL,
  `gstCode` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `billreports`
--

DROP TABLE IF EXISTS `billreports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billreports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `item` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `value` int DEFAULT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_row` (`centerId`,`item`,`month`,`year`),
  KEY `IX_BILLREPORTS_MONTH_YEAR` (`month`,`year`),
  KEY `IX_BILLREPORTS_MONTH` (`month`),
  KEY `IX_BILLREPORTS_YEAR` (`year`),
  KEY `IX_BILLREPORTS_VALUE` (`value`),
  KEY `IX_BILLREPORTS_QUANTITY` (`quantity`),
  KEY `IX_BILLREPORTS_ITEM` (`item`)
) ENGINE=InnoDB AUTO_INCREMENT=149401 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `boron_users`
--

DROP TABLE IF EXISTS `boron_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boron_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(405) DEFAULT NULL,
  `centerid` int DEFAULT NULL,
  `password` text,
  `sessiontoken` text,
  `notificationid` text,
  `ostype` text,
  `mobile` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `case_alert`
--

DROP TABLE IF EXISTS `case_alert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_alert` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `caseId` varchar(100) NOT NULL,
  `caseType` varchar(20) DEFAULT NULL,
  `centerId` varchar(100) DEFAULT NULL,
  `sentToAtlasAt` datetime DEFAULT NULL,
  `tatMinutes` int DEFAULT NULL,
  `tatAlertTime` datetime NOT NULL,
  `tatEmails` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `case_batch_files`
--

DROP TABLE IF EXISTS `case_batch_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_batch_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_id` varchar(40) DEFAULT NULL,
  `element_id` varchar(40) DEFAULT NULL,
  `patient_id` varchar(30) DEFAULT NULL,
  `center_id` int DEFAULT NULL,
  `age` varchar(10) DEFAULT NULL,
  `sex` varchar(10) DEFAULT NULL,
  `device_id` varchar(255) DEFAULT NULL,
  `measurements` varchar(1200) DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `device_acquisition` datetime DEFAULT NULL,
  `acquired_date_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `identifier` varchar(100) DEFAULT NULL,
  `is_completed` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `element_id` (`element_id`)
) ENGINE=InnoDB AUTO_INCREMENT=450 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `case_file`
--

DROP TABLE IF EXISTS `case_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_file` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_id` varchar(60) DEFAULT NULL,
  `case_id` varchar(60) DEFAULT NULL,
  `checksum` varchar(100) DEFAULT NULL,
  `acquired_on` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_id_UNIQUE` (`file_id`),
  KEY `idx_case_file_checksum` (`checksum`),
  KEY `idx_case_file_acquired_on` (`acquired_on`)
) ENGINE=InnoDB AUTO_INCREMENT=14887 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `case_submission_timer`
--

DROP TABLE IF EXISTS `case_submission_timer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_submission_timer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecg_id` varchar(50) NOT NULL,
  `timeout_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ecg_id` (`ecg_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `case_submission_timer_logs`
--

DROP TABLE IF EXISTS `case_submission_timer_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_submission_timer_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecg_id` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1493 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `center_hub_incentives`
--

DROP TABLE IF EXISTS `center_hub_incentives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `center_hub_incentives` (
  `id` int NOT NULL DEFAULT '0',
  `centerid` varchar(255) NOT NULL,
  `incentives` json DEFAULT NULL,
  `billingid` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `center_hub_incentives_bk`
--

DROP TABLE IF EXISTS `center_hub_incentives_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `center_hub_incentives_bk` (
  `id` int NOT NULL DEFAULT '0',
  `centerid` varchar(255) NOT NULL,
  `incentives` json DEFAULT NULL,
  `billingid` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `center_incentives`
--

DROP TABLE IF EXISTS `center_incentives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `center_incentives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerid` varchar(255) NOT NULL,
  `incentives` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centerid` (`centerid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `center_incentives_bk`
--

DROP TABLE IF EXISTS `center_incentives_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `center_incentives_bk` (
  `id` int NOT NULL DEFAULT '0',
  `centerid` varchar(255) NOT NULL,
  `incentives` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `center_workflow_config`
--

DROP TABLE IF EXISTS `center_workflow_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `center_workflow_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `center_id` varchar(255) DEFAULT NULL,
  `stage_sequence` tinyint DEFAULT NULL,
  `atlas_domain` varchar(100) DEFAULT NULL,
  `config` json DEFAULT NULL,
  `timeout` int NOT NULL DEFAULT '-1',
  `signature_config` json DEFAULT NULL,
  `case_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_center_workflow_config_atlas_domain` (`atlas_domain`),
  KEY `center_id` (`center_id`),
  CONSTRAINT `center_workflow_config_ibfk_1` FOREIGN KEY (`center_id`) REFERENCES `centers` (`centerid`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `center_workflow_rule`
--

DROP TABLE IF EXISTS `center_workflow_rule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `center_workflow_rule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rule_number` int DEFAULT NULL,
  `center_id` int DEFAULT NULL,
  `conditions` json DEFAULT NULL,
  `operations` json DEFAULT NULL,
  `enable` tinyint DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_rule_number_centerid_unique` (`rule_number`,`center_id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `center_workflow_rule_v2`
--

DROP TABLE IF EXISTS `center_workflow_rule_v2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `center_workflow_rule_v2` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rule_number` int DEFAULT NULL,
  `center_id` int DEFAULT NULL,
  `conditions` json DEFAULT NULL,
  `operations` json DEFAULT NULL,
  `enable` tinyint DEFAULT NULL,
  `note` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_rule_number_centerid_unique` (`rule_number`,`center_id`),
  KEY `idx_center_id` (`center_id`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `center_workflow_rule_v2_backup_before_split`
--

DROP TABLE IF EXISTS `center_workflow_rule_v2_backup_before_split`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `center_workflow_rule_v2_backup_before_split` (
  `id` int NOT NULL DEFAULT '0',
  `rule_number` int DEFAULT NULL,
  `center_id` int DEFAULT NULL,
  `conditions` json DEFAULT NULL,
  `operations` json DEFAULT NULL,
  `enable` tinyint DEFAULT NULL,
  `note` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centerecs`
--

DROP TABLE IF EXISTS `centerecs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centerecs` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `centerId` int NOT NULL,
  `donorName` varchar(150) DEFAULT NULL,
  `UMRN` varchar(100) DEFAULT NULL,
  `ecsLimit` int DEFAULT NULL,
  `ECSBank` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centerlogos`
--

DROP TABLE IF EXISTS `centerlogos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centerlogos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerid` int NOT NULL,
  `logo` mediumblob,
  `fileName` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centerid` (`centerid`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centerpreferences`
--

DROP TABLE IF EXISTS `centerpreferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centerpreferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centerId` (`centerId`)
) ENGINE=InnoDB AUTO_INCREMENT=979 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centers`
--

DROP TABLE IF EXISTS `centers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centers` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `centerid` varchar(255) NOT NULL,
  `centerName` varchar(255) DEFAULT NULL,
  `Latitude` double DEFAULT NULL,
  `Longitude` double DEFAULT NULL,
  `Address1` varchar(400) DEFAULT NULL,
  `address2` varchar(400) DEFAULT NULL,
  `City` varchar(50) DEFAULT NULL,
  `State` varchar(50) DEFAULT NULL,
  `Country` varchar(50) DEFAULT NULL,
  `Pin` varchar(10) DEFAULT NULL,
  `DeploymentDate` date NOT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `domain` varchar(50) DEFAULT NULL,
  `deactivationDate` datetime DEFAULT NULL,
  `assignedManager` varchar(100) DEFAULT NULL,
  `onboardedBy` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `channelPartner` varchar(100) DEFAULT NULL,
  `isSalesHub` int DEFAULT '0',
  `billingDate` datetime DEFAULT NULL,
  `ecgWebhook` varchar(200) DEFAULT NULL,
  `agreementDate` date DEFAULT NULL,
  `fieldOps` varchar(100) DEFAULT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `timeZone` varchar(100) DEFAULT NULL,
  `managerincentive` varchar(200) DEFAULT NULL,
  `salesincentive` varchar(200) DEFAULT NULL,
  `lsqid` varchar(200) DEFAULT NULL,
  `isMiddleMan` int DEFAULT '0',
  `middleManPreference` varchar(50) DEFAULT NULL,
  `autoSkipEcg` int DEFAULT '0',
  `followUpCallPreference` int DEFAULT '1',
  `customFields` json DEFAULT NULL,
  `suspended` int DEFAULT '0',
  `supressfinalClassification` int DEFAULT '1',
  `doctorLevel` int DEFAULT '2',
  `tlasDomainId` varchar(255) DEFAULT 'TricogInt',
  `lastModifiedAt` datetime DEFAULT NULL,
  `lastModifiedBy` varchar(150) DEFAULT NULL,
  `mqId` int DEFAULT NULL,
  `parentMqId` int DEFAULT NULL,
  `mqLastModifiedDateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `billPlanType` varchar(30) DEFAULT NULL,
  `mqLastSyncDateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `domain` (`domain`),
  KEY `idx_centers_Status` (`Status`),
  KEY `idx_centers_centerid` (`centerid`),
  KEY `idx_centers_type` (`type`),
  KEY `idx_centers_suspended` (`suspended`),
  KEY `idx_centers_DeploymentDate` (`DeploymentDate`),
  KEY `idx_centers_isSalesHub` (`isSalesHub`),
  KEY `idx_centers_timeZone` (`timeZone`),
  KEY `idx_centers_assignedManager` (`assignedManager`),
  KEY `idx_centers_deactivationDate` (`deactivationDate`),
  KEY `idx_centers_channelPartner` (`channelPartner`),
  KEY `centers_idx_channel_suspend_status_id` (`channelPartner`,`suspended`,`Status`,`ID`),
  KEY `idx_mqId` (`mqId`),
  KEY `idx_parentMqId` (`parentMqId`)
) ENGINE=InnoDB AUTO_INCREMENT=325 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `centershistorytrigger` AFTER UPDATE ON `centers` FOR EACH ROW begin
			if New.status <> old.status then
			insert into centershistory (centerId, oldVal, newVal,event, date) values (new.Id, old.status, new.status, 'status',now());
			end if;
				if New.type <> old.type then
			insert into centershistory (centerId, oldVal, newVal,event, date) values (new.Id, old.type, new.type, 'type',now());
			end if;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `centers_bck`
--

DROP TABLE IF EXISTS `centers_bck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centers_bck` (
  `ID` int NOT NULL DEFAULT '0',
  `centerid` varchar(255) NOT NULL,
  `centerName` varchar(255) DEFAULT NULL,
  `Latitude` double DEFAULT NULL,
  `Longitude` double DEFAULT NULL,
  `Address1` varchar(400) DEFAULT NULL,
  `address2` varchar(400) DEFAULT NULL,
  `City` varchar(50) DEFAULT NULL,
  `State` varchar(50) DEFAULT NULL,
  `Country` varchar(50) DEFAULT NULL,
  `Pin` varchar(10) DEFAULT NULL,
  `DeploymentDate` date NOT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `domain` varchar(50) DEFAULT NULL,
  `deactivationDate` datetime DEFAULT NULL,
  `assignedManager` varchar(100) DEFAULT NULL,
  `onboardedBy` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `channelPartner` varchar(100) DEFAULT NULL,
  `isSalesHub` int DEFAULT '0',
  `billingDate` datetime DEFAULT NULL,
  `ecgWebhook` varchar(200) DEFAULT NULL,
  `agreementDate` date DEFAULT NULL,
  `fieldOps` varchar(100) DEFAULT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `timeZone` varchar(100) DEFAULT NULL,
  `managerincentive` varchar(200) DEFAULT NULL,
  `salesincentive` varchar(200) DEFAULT NULL,
  `lsqid` varchar(200) DEFAULT NULL,
  `isMiddleMan` int DEFAULT '0',
  `middleManPreference` varchar(50) DEFAULT NULL,
  `autoSkipEcg` int DEFAULT '0',
  `followUpCallPreference` int DEFAULT '1',
  `customFields` json DEFAULT NULL,
  `suspended` int DEFAULT '0',
  `supressfinalClassification` int DEFAULT '1',
  `doctorLevel` int DEFAULT '2',
  `tlasDomainId` varchar(255) DEFAULT 'TricogInt'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centers_config`
--

DROP TABLE IF EXISTS `centers_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centers_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` json DEFAULT NULL,
  `active` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centers_config_ibfk_2` (`centerId`,`name`),
  KEY `fk_centerId` (`centerId`),
  CONSTRAINT `centers_config_ibfk_1` FOREIGN KEY (`centerId`) REFERENCES `centers` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4877 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centers_config_backup_july18`
--

DROP TABLE IF EXISTS `centers_config_backup_july18`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centers_config_backup_july18` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` json DEFAULT NULL,
  `active` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centers_config_ibfk_2` (`centerId`,`name`),
  KEY `fk_centerId` (`centerId`)
) ENGINE=InnoDB AUTO_INCREMENT=4762 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centers_config_backup_july22`
--

DROP TABLE IF EXISTS `centers_config_backup_july22`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centers_config_backup_july22` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` json DEFAULT NULL,
  `active` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centers_config_ibfk_2` (`centerId`,`name`),
  KEY `fk_centerId` (`centerId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centershistory`
--

DROP TABLE IF EXISTS `centershistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centershistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `newVal` varchar(255) DEFAULT NULL,
  `oldVal` varchar(255) DEFAULT NULL,
  `event` varchar(50) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centerusagemodel`
--

DROP TABLE IF EXISTS `centerusagemodel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centerusagemodel` (
  `centerId` int DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `numberOfEcgs` int DEFAULT NULL,
  `startDataId` int DEFAULT NULL,
  `pending` int DEFAULT NULL,
  `raisedAlerts` int DEFAULT '0',
  `startDate` date DEFAULT NULL,
  `voucherId` varchar(50) DEFAULT NULL,
  `validity` int DEFAULT NULL,
  `ecgs` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `caseConsumed` int DEFAULT '0',
  `originalDataId` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_pending_expiryDate` (`pending`,`expiryDate`),
  KEY `idx_centerId` (`centerId`),
  KEY `idx_startDataId` (`startDataId`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centerusagemodel_backup_july16`
--

DROP TABLE IF EXISTS `centerusagemodel_backup_july16`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centerusagemodel_backup_july16` (
  `centerId` int DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `numberOfEcgs` int DEFAULT NULL,
  `startDataId` int DEFAULT NULL,
  `pending` int DEFAULT NULL,
  `raisedAlerts` int DEFAULT '0',
  `startDate` date DEFAULT NULL,
  `voucherId` varchar(50) DEFAULT NULL,
  `validity` int DEFAULT NULL,
  `ecgs` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `idx_pending_expiryDate` (`pending`,`expiryDate`),
  KEY `idx_centerId` (`centerId`),
  KEY `idx_startDataId` (`startDataId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centerusagemodel_backup_may25`
--

DROP TABLE IF EXISTS `centerusagemodel_backup_may25`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centerusagemodel_backup_may25` (
  `id` int NOT NULL DEFAULT '0',
  `centerId` int DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `numberOfEcgs` int DEFAULT NULL,
  `startDataId` int DEFAULT NULL,
  `pending` int DEFAULT NULL,
  `raisedAlerts` int DEFAULT '0',
  `startDate` date DEFAULT NULL,
  `voucherId` varchar(50) DEFAULT NULL,
  `validity` int DEFAULT NULL,
  `ecgs` int DEFAULT NULL,
  `amount` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centerusagemodel_new_backup`
--

DROP TABLE IF EXISTS `centerusagemodel_new_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centerusagemodel_new_backup` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `numberOfEcgs` int DEFAULT NULL,
  `startDataId` int DEFAULT NULL,
  `pending` int DEFAULT NULL,
  `raisedAlerts` int DEFAULT '0',
  `startDate` date DEFAULT NULL,
  `voucherId` varchar(50) DEFAULT NULL,
  `validity` int DEFAULT NULL,
  `ecgs` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `caseConsumed` int DEFAULT '0',
  `originalDataId` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_centerusagemodel_centerId` (`centerId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centerusagestats`
--

DROP TABLE IF EXISTS `centerusagestats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centerusagestats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `weekday` json DEFAULT NULL,
  `weekend` json DEFAULT NULL,
  `raisedAlertTime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centerId` (`centerId`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centervisits`
--

DROP TABLE IF EXISTS `centervisits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centervisits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `checkInTime` datetime DEFAULT NULL,
  `checkoutTime` datetime DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `who` varchar(100) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `visitPurpose` varchar(200) DEFAULT NULL,
  `attachment` varchar(200) DEFAULT NULL,
  `leadId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `channelpartner`
--

DROP TABLE IF EXISTS `channelpartner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channelpartner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(1000) DEFAULT NULL,
  `delete_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `channelpartner_member`
--

DROP TABLE IF EXISTS `channelpartner_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channelpartner_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(1000) DEFAULT NULL,
  `email` varchar(1000) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `channelPartnerId` int DEFAULT NULL,
  `photo` varchar(200) DEFAULT NULL,
  `refreshToken` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clinical_impressions`
--

DROP TABLE IF EXISTS `clinical_impressions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinical_impressions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `patient_uid` bigint unsigned NOT NULL,
  `value` json NOT NULL,
  `effective_date_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ums_id` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patient_uid` (`patient_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_caseactivities`
--

DROP TABLE IF EXISTS `cn_caseactivities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_caseactivities` (
  `activityid` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  `userid` int DEFAULT NULL,
  `typeofactivity` varchar(45) DEFAULT NULL,
  `content` json DEFAULT NULL,
  `caseid` int NOT NULL,
  `center_id` varchar(45) DEFAULT NULL,
  `patient_uid` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`activityid`),
  KEY `ix_cnca_caseid` (`caseid`),
  KEY `idx_cn_caseactivities_userid` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=5057 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_casecenters`
--

DROP TABLE IF EXISTS `cn_casecenters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_casecenters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `caseid` int NOT NULL,
  `centerid` int NOT NULL,
  `addedon` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ cn_casecenters_centerid` (`centerid`),
  KEY `idx_ cn_casecenters_caseid` (`caseid`)
) ENGINE=InnoDB AUTO_INCREMENT=384 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_caseparticipants`
--

DROP TABLE IF EXISTS `cn_caseparticipants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_caseparticipants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `caseid` int DEFAULT NULL,
  `userid` int DEFAULT NULL,
  `centerid` int DEFAULT NULL,
  `addedbyuserid` int DEFAULT NULL,
  `addedbyusercenterid` int DEFAULT NULL,
  `addedon` datetime DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `istrackinglocation` int DEFAULT NULL,
  `rejectionnote` varchar(300) DEFAULT NULL,
  `teamid` int DEFAULT NULL,
  `lastreadactivityid` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_cncp_caseid` (`caseid`),
  KEY `idx_cn_caseparticipants_userid` (`userid`),
  KEY `idx_cn_caseparticipants_centerid` (`centerid`),
  KEY `idx_cn_caseparticipants_lastreadactivityid` (`lastreadactivityid`),
  KEY `idx_cn_caseparticipants_addedbyuserid` (`addedbyuserid`),
  KEY `idx_cn_caseparticipants_addedbycenterid` (`addedbyusercenterid`),
  KEY `idx_userid_caseid_status` (`userid`,`caseid`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=1292 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_caserules`
--

DROP TABLE IF EXISTS `cn_caserules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_caserules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerid` int NOT NULL,
  `rules` json DEFAULT NULL,
  `enable` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `centerid` (`centerid`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_cases`
--

DROP TABLE IF EXISTS `cn_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_cases` (
  `caseid` int NOT NULL AUTO_INCREMENT,
  `ecgid` varchar(45) DEFAULT NULL,
  `patientname` varchar(200) DEFAULT NULL,
  `origincenterid` int DEFAULT NULL,
  `originuserid` int DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `mobile` varchar(45) DEFAULT NULL,
  `vitals` json DEFAULT NULL,
  `severity` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `startedon` datetime DEFAULT NULL,
  `livetrackinglocation` json DEFAULT NULL,
  `closereason` json DEFAULT NULL,
  `autocreated` int DEFAULT NULL,
  `ishighrisk` tinyint DEFAULT '0',
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(150) DEFAULT NULL,
  `patient_uid` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`caseid`),
  UNIQUE KEY `ecgid_UNIQUE` (`ecgid`),
  KEY `ix_cncases_ecgid` (`ecgid`),
  KEY `idx_cn_cases_centerid` (`origincenterid`),
  KEY `idx_cn_cases_userid` (`originuserid`),
  KEY `idx_last_modified_on` (`last_modified_on`)
) ENGINE=InnoDB AUTO_INCREMENT=553 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_cases_tags`
--

DROP TABLE IF EXISTS `cn_cases_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_cases_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `caseId` int NOT NULL,
  `centerId` int NOT NULL,
  `tag` enum('STEMI_CRITICAL','CRITICAL') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_caseId_tag_centerId` (`caseId`,`tag`,`centerId`),
  KEY `idx_caseid_tag` (`caseId`,`tag`),
  KEY `idx_caseid` (`caseId`),
  KEY `idx_createdat` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=227 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_centernetwork`
--

DROP TABLE IF EXISTS `cn_centernetwork`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_centernetwork` (
  `id` int NOT NULL AUTO_INCREMENT,
  `origincenterid` int NOT NULL,
  `referringcenterid` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_centerusers`
--

DROP TABLE IF EXISTS `cn_centerusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_centerusers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerid` int DEFAULT NULL,
  `userid` int DEFAULT NULL,
  `iscoordinator` int DEFAULT NULL,
  `isreferrable` int DEFAULT NULL,
  `user_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cn_centerusers_centerid` (`centerid`),
  KEY `idx_cn_centerusers_userid` (`userid`),
  KEY `idx_userid` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_sessions`
--

DROP TABLE IF EXISTS `cn_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_sessions` (
  `userId` varchar(45) NOT NULL,
  `token` varchar(45) NOT NULL,
  `logintime` datetime DEFAULT NULL,
  `logouttime` datetime DEFAULT NULL,
  `notificationid` varchar(1000) DEFAULT NULL,
  `ostype` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_teams`
--

DROP TABLE IF EXISTS `cn_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_teams` (
  `teamid` int NOT NULL AUTO_INCREMENT,
  `centerid` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `acceptpreference` varchar(45) DEFAULT NULL,
  `status` enum('active','deactive') DEFAULT 'active',
  PRIMARY KEY (`teamid`),
  KEY `idx_cn_teams_centerid` (`centerid`),
  KEY `idx_cn_teams_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_teamusers`
--

DROP TABLE IF EXISTS `cn_teamusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_teamusers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teamid` int NOT NULL,
  `userid` int NOT NULL,
  `iscoordinator` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_tricogdoctors`
--

DROP TABLE IF EXISTS `cn_tricogdoctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_tricogdoctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userid` int DEFAULT NULL,
  `tricogdoctorid` int NOT NULL,
  `centerid` int DEFAULT NULL,
  PRIMARY KEY (`id`,`tricogdoctorid`),
  UNIQUE KEY `cn_doctorwithuserrolecol_UNIQUE` (`tricogdoctorid`),
  KEY `userid_index` (`userid`),
  KEY `centerid__index` (`centerid`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_users`
--

DROP TABLE IF EXISTS `cn_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_users` (
  `userid` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(45) DEFAULT NULL,
  `lastname` varchar(45) DEFAULT NULL,
  `designation` varchar(45) DEFAULT NULL,
  `mobile` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `title` varchar(10) DEFAULT NULL,
  `qualifications` varchar(45) DEFAULT NULL,
  `passwordhash` text,
  `lastupdated` varchar(45) DEFAULT NULL,
  `umsuserid` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `mobile_UNIQUE` (`mobile`),
  KEY `idx_userid` (`umsuserid`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(500) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `bigValue` text,
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `idx_config_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contactverification`
--

DROP TABLE IF EXISTS `contactverification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contactverification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `code` int DEFAULT NULL,
  `verified` int DEFAULT '0',
  `tries` int DEFAULT '0',
  `codeCount` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `coordinatorapps`
--

DROP TABLE IF EXISTS `coordinatorapps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coordinatorapps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `notificationId` varchar(200) DEFAULT NULL,
  `subscribedon` date DEFAULT NULL,
  `token` varchar(1000) DEFAULT NULL,
  `TargetVersion` varchar(10) DEFAULT NULL,
  `os` varchar(10) DEFAULT NULL,
  `username` varchar(20) DEFAULT NULL,
  `doctorId` int DEFAULT NULL,
  `pin` varchar(20) DEFAULT NULL,
  `pinExpiry` datetime DEFAULT NULL,
  `phoneNumber` varchar(50) DEFAULT NULL,
  `appname` varchar(50) DEFAULT NULL,
  `notification_provider` varchar(100) DEFAULT NULL,
  `language_preference` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_coordinatorapps_token` (`token`),
  KEY `index_os` (`os`),
  KEY `index_doctorId` (`doctorId`),
  KEY `index_appname` (`appname`),
  KEY `index_centerId` (`centerId`)
) ENGINE=InnoDB AUTO_INCREMENT=1963 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `copy_centers_config`
--

DROP TABLE IF EXISTS `copy_centers_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `copy_centers_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` json DEFAULT NULL,
  `active` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centers_config_ibfk_2` (`centerId`,`name`),
  KEY `fk_centerId` (`centerId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customer_data_backup`
--

DROP TABLE IF EXISTS `customer_data_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_data_backup` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `center_name` varchar(255) NOT NULL,
  `process_name` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `additional_info` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customercredits`
--

DROP TABLE IF EXISTS `customercredits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customercredits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `creditId` varchar(50) DEFAULT NULL,
  `qbid` varchar(50) DEFAULT NULL,
  `qbdomain` int DEFAULT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `creditData` longtext,
  `totalAmount` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index2` (`creditId`,`qbdomain`),
  KEY `IX_QB_ID_CREDITS` (`qbid`),
  KEY `IX_MONTH_CREDITS` (`month`),
  KEY `IX_YEAR_CREDITS` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customerinvoices`
--

DROP TABLE IF EXISTS `customerinvoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customerinvoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceId` varchar(50) DEFAULT NULL,
  `qbid` varchar(50) DEFAULT NULL,
  `qbdomain` int DEFAULT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `invoiceData` longtext,
  `totalAmount` double DEFAULT NULL,
  `balance` double DEFAULT NULL,
  `InvoiceLastModified` timestamp GENERATED ALWAYS AS (json_unquote(json_extract(`invoiceData`,_utf8mb4'$.MetaData.LastUpdatedTime'))) VIRTUAL NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index2` (`invoiceId`,`qbdomain`),
  KEY `IX_QB_ID_INVOICES` (`qbid`),
  KEY `IX_MONTH_INVOICES` (`month`),
  KEY `IX_YEAR_INVOICES` (`year`),
  KEY `LastModified_Idx` (`InvoiceLastModified`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customerinvoices_bk`
--

DROP TABLE IF EXISTS `customerinvoices_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customerinvoices_bk` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceId` varchar(50) DEFAULT NULL,
  `qbid` varchar(50) DEFAULT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `invoiceData` longtext,
  `totalAmount` double DEFAULT NULL,
  `balance` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoiceId` (`invoiceId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customerpayments`
--

DROP TABLE IF EXISTS `customerpayments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customerpayments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paymentId` varchar(50) DEFAULT NULL,
  `qbid` varchar(50) DEFAULT NULL,
  `qbdomain` int DEFAULT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `paymentData` longtext,
  `totalAmount` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paymentId` (`paymentId`,`qbdomain`),
  KEY `IX_QB_ID_PAYMENTS` (`qbid`),
  KEY `IX_MONTH_PAYMENTS` (`month`),
  KEY `IX_YEAR_PAYMENTS` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customerportalusers`
--

DROP TABLE IF EXISTS `customerportalusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customerportalusers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(1000) DEFAULT NULL,
  `password_reset_token` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data`
--

DROP TABLE IF EXISTS `data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data` (
  `DataID` int NOT NULL AUTO_INCREMENT,
  `ID` varchar(40) NOT NULL,
  `PatientID` varchar(30) DEFAULT NULL,
  `Age` varchar(10) DEFAULT NULL,
  `sex` varchar(10) DEFAULT NULL,
  `AcquiredDate` date DEFAULT NULL,
  `AcquiredTime` time DEFAULT NULL,
  `DeviceID` varchar(255) DEFAULT NULL,
  `diagnosis` varchar(2000) DEFAULT NULL,
  `measurements` varchar(1200) DEFAULT NULL,
  `Status` varchar(20) DEFAULT NULL,
  `TimeRead` datetime DEFAULT NULL,
  `CenterID` varchar(255) NOT NULL,
  `Abnormalities` varchar(500) DEFAULT NULL,
  `DiagnosedBy` varchar(100) DEFAULT NULL,
  `MacDiagnosis` varchar(2000) DEFAULT NULL,
  `MacDiagnosisCodes` varchar(200) DEFAULT NULL,
  `HubDiagnosisCode` varchar(500) DEFAULT NULL,
  `IsChanged` int DEFAULT NULL,
  `imageGuid` varchar(5000) DEFAULT NULL,
  `DeviceAcquisition` datetime DEFAULT NULL,
  `isCritical` int DEFAULT NULL,
  `HasError` int DEFAULT NULL,
  `ShortCode` varchar(10) DEFAULT NULL,
  `skip` int DEFAULT '0',
  `isEscalated` int DEFAULT '0',
  `telegramChat` json DEFAULT NULL,
  `rejectReason` varchar(250) DEFAULT NULL,
  `macSerialId` varchar(100) DEFAULT NULL,
  `linkedEcg` varchar(50) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `followUp` varchar(100) DEFAULT NULL,
  `billingId` int DEFAULT NULL,
  `errorReason` varchar(50) DEFAULT NULL,
  `dignosisSentToMaestro` int DEFAULT '0',
  `ecgMachineType` varchar(25) DEFAULT NULL,
  `finalclassification` varchar(50) DEFAULT NULL,
  `isDownloaded` varchar(20) DEFAULT NULL,
  `isSentToPatient` varchar(20) DEFAULT NULL,
  `AcquiredDateTime` datetime DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `isRequestForRepeat` int DEFAULT NULL,
  `sentToAtlasAt` datetime DEFAULT NULL,
  `isDigital` tinyint DEFAULT '1',
  `type` varchar(20) DEFAULT 'RESTING',
  `lastModifiedAt` datetime DEFAULT NULL,
  `lastModifiedBy` varchar(150) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(150) DEFAULT NULL,
  `patient_uid` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`DataID`),
  UNIQUE KEY `ID` (`ID`),
  KEY `idx_centerid` (`CenterID`),
  KEY `idx_id` (`ID`),
  KEY `idx_data_AcquiredDate_AcquiredTime` (`AcquiredDate`,`AcquiredTime`),
  KEY `idx_status` (`Status`),
  KEY `ix_data_deviceid` (`DeviceID`),
  KEY `sentToAtlasAt_idx` (`sentToAtlasAt`),
  KEY `deviceId_idx` (`DeviceID`),
  KEY `idx_data_type` (`type`),
  KEY `idx_data_TimeRead` (`TimeRead`),
  KEY `idx_data_skip` (`skip`),
  KEY `idx_data_HasError` (`HasError`),
  KEY `idx_data_PatientID` (`PatientID`),
  KEY `idx_data_isCritical` (`isCritical`),
  KEY `idx_data_diagnosis` (`diagnosis`),
  KEY `idx_data_isDigital` (`isDigital`),
  KEY `idx_data_dignosisSentToMaestro` (`dignosisSentToMaestro`),
  KEY `AcquiredDateTime_idx` (`AcquiredDateTime`),
  KEY `data_idx_type_errorreason` (`type`,`errorReason`),
  KEY `errorReason_index` (`errorReason`),
  KEY `idx_last_modified_on` (`last_modified_on`),
  KEY `idx_patient_uid` (`patient_uid`)
) ENGINE=InnoDB AUTO_INCREMENT=49436 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_extension`
--

DROP TABLE IF EXISTS `data_extension`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_extension` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecg_id` varchar(40) NOT NULL,
  `initial_eta` int DEFAULT NULL COMMENT 'ETA in Minutes from ATLAS',
  `custom_tags` json DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `report_images` json DEFAULT NULL,
  `pending_upload` int DEFAULT NULL,
  `case_reason` json DEFAULT NULL,
  `case_submitted_at` datetime DEFAULT NULL,
  `case_submitted_by` varchar(100) DEFAULT NULL,
  `batch_file_count` int DEFAULT NULL,
  `batch_timeout` int DEFAULT NULL,
  `is_batch_timedout` int DEFAULT '0',
  `comments` text,
  `case_submission_type` varchar(50) DEFAULT NULL,
  `case_submission_after_timeout` datetime DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `workflow_rule` json DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ecg_id` (`ecg_id`),
  KEY `idx_pending_upload` (`pending_upload`),
  KEY `idx_case_submission_type` (`case_submission_type`),
  KEY `idx_last_modified_on` (`last_modified_on`),
  CONSTRAINT `data_extension_ibfk_1` FOREIGN KEY (`ecg_id`) REFERENCES `data` (`ID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1878 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_tags`
--

DROP TABLE IF EXISTS `data_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(100) NOT NULL,
  `centerId` varchar(100) NOT NULL,
  `tag` enum('STEMI_CRITICAL','CRITICAL') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_ecgid_tag_centerId` (`ecgId`,`tag`,`centerId`),
  KEY `idx_tag` (`tag`),
  KEY `idx_ecgid` (`ecgId`),
  KEY `idx_createdat` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=595 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dev2ctr`
--

DROP TABLE IF EXISTS `dev2ctr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dev2ctr` (
  `DeviceID` varchar(255) NOT NULL,
  `CenterID` varchar(255) NOT NULL,
  `StartDateTime` datetime NOT NULL,
  `EndDateTime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `DeviceID` varchar(255) NOT NULL,
  `CenterID` varchar(15) DEFAULT NULL,
  `AutoSSH-Port` int DEFAULT NULL,
  `KeepAlive` int DEFAULT NULL,
  `LastHeartBeat` datetime DEFAULT NULL,
  `CodeUpdateNeeded` int DEFAULT NULL,
  `ModemIMEI` varchar(64) DEFAULT NULL,
  `SIMID` varchar(64) DEFAULT NULL,
  `LastDataSync` datetime DEFAULT NULL,
  `MobileNo` varchar(16) DEFAULT NULL,
  `HardwareVersion` varchar(50) DEFAULT NULL,
  `WifiSSID` varchar(200) DEFAULT NULL,
  `WifiKey` varchar(200) DEFAULT NULL,
  `SendLog` int DEFAULT '0',
  `RemoteReboot` int DEFAULT '0',
  `type` varchar(10) DEFAULT NULL,
  `token` text,
  `gotToken` int DEFAULT '0',
  `Status` varchar(50) DEFAULT NULL,
  `formatNeeded` int DEFAULT '0',
  `serialNo` varchar(50) DEFAULT NULL,
  `branchName` varchar(50) DEFAULT NULL,
  `stopHeartbeat` int DEFAULT '0',
  `lastHeartbeatData` json DEFAULT NULL,
  `deviceType` varchar(30) DEFAULT NULL,
  `SuspendedState` int DEFAULT '0',
  UNIQUE KEY `ID` (`ID`),
  UNIQUE KEY `DeviceID` (`DeviceID`),
  KEY `CenterID_idx` (`CenterID`),
  KEY `idx_status` (`Status`)
) ENGINE=InnoDB AUTO_INCREMENT=2050 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `dev2ctrtrigger` AFTER UPDATE ON `devices` FOR EACH ROW begin
			if New.centerId <> old.centerId then
		UPDATE dev2ctr SET EndDateTime = now() WHERE deviceID = new.id AND EndDateTime is null;

			insert into dev2ctr (centerId, deviceId, startDateTime) values (new.centerId, new.id, now());
			end if;
            
		end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `diagnosis`
--

DROP TABLE IF EXISTS `diagnosis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnosis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(40) DEFAULT NULL,
  `doctor` varchar(30) DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `diagnosis` varchar(2000) DEFAULT NULL,
  `diagnosisCode` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `diagType` varchar(10) DEFAULT NULL,
  `isCritical` int DEFAULT NULL,
  `ecgType` enum('RESTING','TMT','ECHO') DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_diagnosis_ecgId` (`ecgId`),
  KEY `idx_last_modified_on` (`last_modified_on`)
) ENGINE=InnoDB AUTO_INCREMENT=323629 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `DoctorName` varchar(30) NOT NULL,
  `user_id` varchar(45) DEFAULT NULL,
  `Mobile` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(1000) DEFAULT NULL,
  `sharingPreferences` varchar(1000) DEFAULT NULL,
  `centerId` int DEFAULT NULL,
  `isPrimary` int DEFAULT NULL,
  `lastOpenedApp` datetime DEFAULT NULL,
  `appversion` varchar(20) DEFAULT NULL,
  `os` varchar(20) DEFAULT NULL,
  `telegramChatId` varchar(100) DEFAULT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `isHubManager` int DEFAULT '0',
  `referralPreferences` varchar(30) DEFAULT 'ALL',
  `notificationPreferences` json DEFAULT NULL,
  `lastOpenedHubbr` datetime DEFAULT NULL,
  `lastOpenedCustomerPortal` datetime DEFAULT NULL,
  `web_notification_token` varchar(300) DEFAULT NULL,
  `referral_code` varchar(20) DEFAULT NULL,
  `referedby_code` varchar(20) DEFAULT NULL,
  `language_preference` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `idx_doctors_centerId_isPrimary` (`centerId`,`isPrimary`),
  KEY `idx_doctors_email` (`email`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9047 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctors_backup_DEV_2445`
--

DROP TABLE IF EXISTS `doctors_backup_DEV_2445`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors_backup_DEV_2445` (
  `Id` bigint NOT NULL DEFAULT '0',
  `DoctorName` varchar(30) NOT NULL,
  `Mobile` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(1000) DEFAULT NULL,
  `sharingPreferences` varchar(1000) DEFAULT NULL,
  `centerId` int DEFAULT NULL,
  `isPrimary` int DEFAULT NULL,
  `lastOpenedApp` datetime DEFAULT NULL,
  `appversion` varchar(20) DEFAULT NULL,
  `os` varchar(20) DEFAULT NULL,
  `telegramChatId` varchar(100) DEFAULT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `isHubManager` int DEFAULT '0',
  `referralPreferences` varchar(30) DEFAULT 'ALL',
  `notificationPreferences` json DEFAULT NULL,
  `lastOpenedHubbr` datetime DEFAULT NULL,
  `lastOpenedCustomerPortal` datetime DEFAULT NULL,
  `web_notification_token` varchar(300) DEFAULT NULL,
  `referral_code` varchar(20) DEFAULT NULL,
  `referedby_code` varchar(20) DEFAULT NULL,
  `language_preference` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `donotbillcenters`
--

DROP TABLE IF EXISTS `donotbillcenters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donotbillcenters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `centerId` int DEFAULT NULL,
  `reason` varchar(150) DEFAULT NULL,
  `who` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecg_api_status`
--

DROP TABLE IF EXISTS `ecg_api_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecg_api_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(40) DEFAULT NULL,
  `api_type` enum('PATIENT_DETAILS_API','REPORT_HOOK') DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `additional_info` json DEFAULT NULL,
  `retry_count` int DEFAULT '0',
  `last_try_time` datetime DEFAULT NULL,
  `status` enum('SUCCESS','FAILED','ABORTED') DEFAULT NULL,
  `custom_error_code` varchar(20) DEFAULT NULL,
  `reason` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ecgId` (`ecgId`),
  KEY `ecgId_idx` (`ecgId`),
  KEY `status_idx` (`status`),
  KEY `ecg_api_status_idx_status_ecgid` (`status`,`ecgId`),
  CONSTRAINT `ecg_api_status_ibfk_1` FOREIGN KEY (`ecgId`) REFERENCES `data` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=29510 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecg_download_logs`
--

DROP TABLE IF EXISTS `ecg_download_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecg_download_logs` (
  `ecgid` varchar(40) DEFAULT NULL,
  `emailid` varchar(100) DEFAULT NULL,
  `download_at` datetime DEFAULT NULL,
  `download_from` varchar(250) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  KEY `idx_ecgid` (`ecgid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecg_eta`
--

DROP TABLE IF EXISTS `ecg_eta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecg_eta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecg_id` varchar(40) DEFAULT NULL,
  `estimation` int NOT NULL COMMENT 'ETA in Minutes',
  `created_at` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgassignment`
--

DROP TABLE IF EXISTS `ecgassignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgassignment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(50) NOT NULL,
  `viewerId` varchar(250) NOT NULL,
  `assignedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ecgId` (`ecgId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgauditlogs`
--

DROP TABLE IF EXISTS `ecgauditlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgauditlogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jsonData` longtext,
  `action` varchar(100) DEFAULT NULL,
  `app` varchar(50) DEFAULT NULL,
  `ecgid` varchar(50) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ecgauditlogs_ecgid` (`ecgid`),
  KEY `IX_ACTION_ECGAUDIT` (`action`),
  KEY `ecgauditlogs_idx_action_ecgid` (`action`,`ecgid`),
  KEY `index_timestamp` (`timestamp`)
) ENGINE=InnoDB AUTO_INCREMENT=238 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgdoctors`
--

DROP TABLE IF EXISTS `ecgdoctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgdoctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(40) NOT NULL,
  `doctorId` int NOT NULL,
  `centerId` int NOT NULL,
  `seen` int DEFAULT '0',
  `docType` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ecgid` (`ecgId`),
  KEY `ix_doctorid` (`doctorId`),
  KEY `ix_ed_center` (`centerId`),
  KEY `ecgdoctors_idx_centerid_ecgid` (`centerId`,`ecgId`)
) ENGINE=InnoDB AUTO_INCREMENT=117202 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgdoctors_new`
--

DROP TABLE IF EXISTS `ecgdoctors_new`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgdoctors_new` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(40) NOT NULL,
  `doctorId` int NOT NULL,
  `centerId` int NOT NULL,
  `seen` int DEFAULT '0',
  `docType` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ecgid` (`ecgId`),
  KEY `ix_doctorid` (`doctorId`),
  KEY `ix_ed_center` (`centerId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgmiddleman`
--

DROP TABLE IF EXISTS `ecgmiddleman`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgmiddleman` (
  `id` varchar(50) NOT NULL,
  `patientId` varchar(50) DEFAULT NULL,
  `age` varchar(10) DEFAULT NULL,
  `sex` varchar(10) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `HubDiagnosis` varchar(1000) DEFAULT NULL,
  `acquired` datetime DEFAULT NULL,
  `centerId` int DEFAULT NULL,
  `domain` varchar(50) DEFAULT NULL,
  `centerName` varchar(255) DEFAULT NULL,
  `doctorUsername` varchar(50) DEFAULT NULL,
  `imageGuid` varchar(50) DEFAULT NULL,
  `isCritical` int DEFAULT '0',
  `measurements` varchar(1000) DEFAULT NULL,
  `diagnosis` varchar(1000) DEFAULT NULL,
  `timeread` datetime DEFAULT NULL,
  `isnotificationsent` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgmiddlemanv1`
--

DROP TABLE IF EXISTS `ecgmiddlemanv1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgmiddlemanv1` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(50) DEFAULT NULL,
  `middleManDoctor` varchar(100) DEFAULT NULL,
  `isnotificationsent` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgpaper`
--

DROP TABLE IF EXISTS `ecgpaper`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgpaper` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `jiraIssue` varchar(20) DEFAULT NULL,
  `requestDate` datetime DEFAULT NULL,
  `dispatchDate` datetime DEFAULT NULL,
  `paperRequested` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jiraIssue` (`jiraIssue`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgpaperplanconfig`
--

DROP TABLE IF EXISTS `ecgpaperplanconfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgpaperplanconfig` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgprioritizationlogs`
--

DROP TABLE IF EXISTS `ecgprioritizationlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgprioritizationlogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jsonData` longtext,
  `centerId` varchar(20) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecgsignatures`
--

DROP TABLE IF EXISTS `ecgsignatures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecgsignatures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(100) DEFAULT NULL,
  `doctorName` varchar(200) DEFAULT NULL,
  `qualifications` varchar(500) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `registrationNumber` varchar(50) DEFAULT NULL,
  `signatureId` varchar(50) DEFAULT NULL,
  `doctorLevel` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ecgsignatures_ecgId` (`ecgId`)
) ENGINE=InnoDB AUTO_INCREMENT=232635 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ecsinfo`
--

DROP TABLE IF EXISTS `ecsinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecsinfo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `ecsBank` varchar(50) DEFAULT NULL,
  `jiraTicketKey` varchar(50) DEFAULT NULL,
  `acknowledgementReportUploaded` int DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emailvalidation`
--

DROP TABLE IF EXISTS `emailvalidation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emailvalidation` (
  `email` varchar(100) NOT NULL,
  `isValid` int DEFAULT '0',
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `amount` varchar(20) DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `external_patient`
--

DROP TABLE IF EXISTS `external_patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `external_patient` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patientId` varchar(45) DEFAULT NULL,
  `centerId` varchar(45) DEFAULT NULL,
  `patient_data` json DEFAULT NULL,
  `api_type` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `retry_count` int DEFAULT '0',
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index2` (`patientId`,`centerId`,`approved_at`),
  KEY `idx_approved_created` (`approved_at`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=444 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `external_patient_log`
--

DROP TABLE IF EXISTS `external_patient_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `external_patient_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patientId` varchar(45) DEFAULT NULL,
  `centerId` varchar(45) DEFAULT NULL,
  `patient_data` json DEFAULT NULL,
  `api_type` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=574 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `followCalls`
--

DROP TABLE IF EXISTS `followCalls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `followCalls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `isComplete` int DEFAULT NULL,
  `type` varchar(10) DEFAULT NULL,
  `lastActivity` varchar(255) DEFAULT NULL,
  `followUp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `habits_conditions`
--

DROP TABLE IF EXISTS `habits_conditions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `habits_conditions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `patient_uid` bigint unsigned NOT NULL,
  `value` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ums_id` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patient_uid` (`patient_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `heliumcodeupdates`
--

DROP TABLE IF EXISTS `heliumcodeupdates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `heliumcodeupdates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fileId` varchar(50) DEFAULT NULL,
  `fileName` varchar(50) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `hwVersions` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fileName` (`fileName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hub_group_hubs`
--

DROP TABLE IF EXISTS `hub_group_hubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hub_group_hubs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hub_id` varchar(255) NOT NULL,
  `hub_group_id` varchar(50) NOT NULL,
  `organization_id` varchar(50) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hub_group_id` (`hub_group_id`),
  KEY `organization_id` (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hub_group_users`
--

DROP TABLE IF EXISTS `hub_group_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hub_group_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `hub_group_id` varchar(50) NOT NULL,
  `organization_id` varchar(50) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hub_group_id` (`hub_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hub_groups`
--

DROP TABLE IF EXISTS `hub_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hub_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hub_group_id` varchar(50) NOT NULL,
  `hub_group_name` varchar(60) NOT NULL,
  `hub_group_description` varchar(200) DEFAULT NULL,
  `organization_id` varchar(50) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hub_group_id_UNIQUE` (`hub_group_id`),
  UNIQUE KEY `hub_group_name_UNIQUE` (`hub_group_name`),
  KEY `organization_id` (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hubhistory`
--

DROP TABLE IF EXISTS `hubhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hubhistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hubCenterId` int DEFAULT NULL,
  `spokeCenterId` int DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_spokeCenterId` (`spokeCenterId`)
) ENGINE=InnoDB AUTO_INCREMENT=255 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leadcenters`
--

DROP TABLE IF EXISTS `leadcenters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leadcenters` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `centerName` varchar(255) DEFAULT NULL,
  `docName` varchar(255) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `contactNo` varchar(12) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `pin` varchar(10) DEFAULT NULL,
  `addedOn` datetime DEFAULT NULL,
  `addedBy` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lookup`
--

DROP TABLE IF EXISTS `lookup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lookup` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL,
  `value` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lsqactivities`
--

DROP TABLE IF EXISTS `lsqactivities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lsqactivities` (
  `activityid` varchar(200) NOT NULL,
  `lsqid` varchar(200) DEFAULT NULL,
  `activity` varchar(255) DEFAULT NULL,
  `activitydata` json DEFAULT NULL,
  `createdon` datetime DEFAULT NULL,
  `currentstage` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`activityid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lsqdemousers`
--

DROP TABLE IF EXISTS `lsqdemousers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lsqdemousers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lsqUserId` varchar(200) DEFAULT NULL,
  `emailAddress` varchar(100) DEFAULT NULL,
  `userData` json DEFAULT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lsqUserId` (`lsqUserId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lsqleads`
--

DROP TABLE IF EXISTS `lsqleads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lsqleads` (
  `lsqId` varchar(200) NOT NULL,
  `adminPanelId` varchar(200) DEFAULT NULL,
  `clinicName` varchar(255) DEFAULT NULL,
  `lsqStage` varchar(255) DEFAULT NULL,
  `address1` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zip` varchar(10) DEFAULT NULL,
  `ownerid` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`lsqId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medication_statement`
--

DROP TABLE IF EXISTS `medication_statement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medication_statement` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint unsigned NOT NULL,
  `value` json NOT NULL,
  `effective_date_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ums_id` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patient_id` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `middlemandiagnosis`
--

DROP TABLE IF EXISTS `middlemandiagnosis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `middlemandiagnosis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(40) DEFAULT NULL,
  `doctor` varchar(30) DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `diagnosis` varchar(255) DEFAULT NULL,
  `diagnosisCode` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `diagType` varchar(10) DEFAULT NULL,
  `isCritical` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_diagnosis_ecgId` (`ecgId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `middlemanlogin`
--

DROP TABLE IF EXISTS `middlemanlogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `middlemanlogin` (
  `DoctorName` varchar(50) NOT NULL,
  `Username` varchar(20) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `correctReview` int DEFAULT '0',
  `incorrectReview` int DEFAULT '0',
  `isCriticalDoctor` int DEFAULT '0',
  `phoneNumber` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `qualifications` varchar(200) DEFAULT NULL,
  `designation` varchar(200) DEFAULT NULL,
  `noSignature` int DEFAULT '0',
  `signatureImage` mediumblob,
  `registrationNumber` varchar(50) DEFAULT NULL,
  `token` varchar(100) DEFAULT NULL,
  `notificationid` varchar(500) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `signHash` varchar(255) DEFAULT NULL,
  `signatureId` varchar(50) DEFAULT NULL,
  `doctorLevel` int DEFAULT '1',
  `domainId` varchar(255) DEFAULT 'TricogInt',
  PRIMARY KEY (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `middlemanloginsession`
--

DROP TABLE IF EXISTS `middlemanloginsession`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `middlemanloginsession` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` text NOT NULL,
  `doctorusername` varchar(20) NOT NULL,
  `notificationid` text,
  `os` varchar(10) DEFAULT NULL,
  `lastupdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `middlemanlogs`
--

DROP TABLE IF EXISTS `middlemanlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `middlemanlogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgid` varchar(100) NOT NULL,
  `errorreason` text,
  `emailrequest` text,
  `emailresponse` text,
  `smsrequest` text,
  `smsresponse` text,
  `fcmrequest` text,
  `fcmresponse` text,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mobile_app_version`
--

DROP TABLE IF EXISTS `mobile_app_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobile_app_version` (
  `id` int NOT NULL AUTO_INCREMENT,
  `version_no` varchar(45) NOT NULL,
  `description` text,
  `type` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `app_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `version_no_UNIQUE` (`version_no`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `network`
--

DROP TABLE IF EXISTS `network`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `network` (
  `id` int NOT NULL AUTO_INCREMENT,
  `_doctorId` int DEFAULT NULL,
  `hubCenterId` int NOT NULL,
  `spokeCenterId` int NOT NULL,
  `telegramChatId` varchar(50) DEFAULT NULL,
  `last_modified_on` datetime DEFAULT NULL,
  `last_modified_by` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_network_spokeid` (`spokeCenterId`),
  KEY `ix_network_hubid` (`hubCenterId`)
) ENGINE=InnoDB AUTO_INCREMENT=141 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `networkdoctors`
--

DROP TABLE IF EXISTS `networkdoctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `networkdoctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `networkId` int DEFAULT NULL,
  `doctorId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=164 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `CenterId` int DEFAULT NULL,
  `TaskId` bigint DEFAULT NULL,
  `Username` varchar(20) NOT NULL,
  `Note` text NOT NULL,
  `Date` datetime NOT NULL,
  `deviceId` int DEFAULT NULL,
  `macId` int DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_logs`
--

DROP TABLE IF EXISTS `notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(45) DEFAULT NULL,
  `ecgId` varchar(100) NOT NULL,
  `request` json DEFAULT NULL,
  `response` json DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `sent_to` json DEFAULT NULL,
  `transcation_id` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notification_logs_ecgId` (`ecgId`)
) ENGINE=InnoDB AUTO_INCREMENT=1088 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notificationlist`
--

DROP TABLE IF EXISTS `notificationlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificationlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notification` varchar(20) DEFAULT NULL,
  `doctorId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_doctorid` (`doctorId`)
) ENGINE=InnoDB AUTO_INCREMENT=493 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `opsappusers`
--

DROP TABLE IF EXISTS `opsappusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opsappusers` (
  `email` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `phoneNumber` varchar(100) DEFAULT NULL,
  `authToken` varchar(100) DEFAULT NULL,
  `notificationId` varchar(250) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL,
  `pin` varchar(10) DEFAULT NULL,
  `isTricog` int DEFAULT '0',
  `channelName` varchar(150) DEFAULT NULL,
  `telegramChatId` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int DEFAULT NULL,
  `orderData` json DEFAULT NULL,
  `lsqId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organization_audit_logs`
--

DROP TABLE IF EXISTS `organization_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `org_id` varchar(50) DEFAULT NULL,
  `event` varchar(50) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `username` (`username`),
  KEY `org_id` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=630 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organization_members`
--

DROP TABLE IF EXISTS `organization_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organization_id` varchar(50) NOT NULL,
  `member_type` varchar(50) NOT NULL,
  `member_id` varchar(50) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `member_type` (`member_type`),
  KEY `organization_id` (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organization_id` varchar(50) NOT NULL,
  `organization_name` varchar(100) DEFAULT NULL,
  `organization_description` varchar(200) DEFAULT NULL,
  `status` enum('ACTIVE','SUSPENDED','DEACTIVATED') DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `organization_id` (`organization_id`),
  UNIQUE KEY `organization_name` (`organization_name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_case_medical_mapping`
--

DROP TABLE IF EXISTS `patient_case_medical_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_case_medical_mapping` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `patient_uid` char(36) NOT NULL,
  `case_id` bigint unsigned NOT NULL,
  `vitals_id` bigint unsigned DEFAULT NULL,
  `clinical_impressions_id` bigint DEFAULT NULL,
  `medication_statements_id` bigint DEFAULT NULL,
  `habits_conditions_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ums_id` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patient_uid` (`patient_uid`),
  KEY `idx_case_id` (`case_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_center_mapping`
--

DROP TABLE IF EXISTS `patient_center_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_center_mapping` (
  `patient_uid` varchar(45) NOT NULL,
  `center_id` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` varchar(225) NOT NULL,
  UNIQUE KEY `patient_uid_UNIQUE` (`patient_uid`),
  KEY `patient_center` (`center_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_contact_info`
--

DROP TABLE IF EXISTS `patient_contact_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_contact_info` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `country_id` int DEFAULT NULL,
  `phone_number` int NOT NULL,
  `email` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ums_is` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_id` (`patient_id`),
  KEY `idx_patient_id` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_data_medical_mapping`
--

DROP TABLE IF EXISTS `patient_data_medical_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_data_medical_mapping` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `patient_info_uid` char(36) DEFAULT NULL,
  `case_id` char(36) NOT NULL,
  `vitals_id` bigint unsigned DEFAULT NULL,
  `clinical_impressions_id` bigint unsigned DEFAULT NULL,
  `medication_statements_id` bigint unsigned DEFAULT NULL,
  `habits_conditions_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ums_id` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patient_uid` (`patient_info_uid`),
  KEY `idx_case_id` (`case_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_info`
--

DROP TABLE IF EXISTS `patient_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(64) NOT NULL,
  `patient_id` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender_id` tinyint NOT NULL,
  `center_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ums_id` varchar(100) DEFAULT 'MIGRATION',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=1025 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_vitals`
--

DROP TABLE IF EXISTS `patient_vitals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_vitals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `patient_info_id` bigint unsigned NOT NULL,
  `value` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ums_id` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patient_info_id` (`patient_info_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_vitals_history`
--

DROP TABLE IF EXISTS `patient_vitals_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_vitals_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_uid` varchar(45) NOT NULL,
  `center_id` varchar(255) DEFAULT NULL,
  `vitals` json NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `patient_uid` (`patient_uid`)
) ENGINE=InnoDB AUTO_INCREMENT=237 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patientinfo`
--

DROP TABLE IF EXISTS `patientinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patientinfo` (
  `ecgid` varchar(50) NOT NULL,
  `vitals` text,
  `patient_uid` varchar(45) DEFAULT NULL,
  `patientName` varchar(50) DEFAULT NULL,
  `updatedBy` varchar(150) DEFAULT NULL,
  `patientEmail` varchar(50) DEFAULT NULL,
  `patientContact` varchar(20) DEFAULT NULL,
  `additionalInfo` json DEFAULT NULL,
  `referredBy` varchar(60) DEFAULT NULL,
  `cardiacHistory` json DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `age_months` int DEFAULT NULL,
  `age_days` int DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ecgid`),
  KEY `idx_last_modified_on` (`last_modified_on`),
  KEY `idx_patientname` (`patientName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patientotp`
--

DROP TABLE IF EXISTS `patientotp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patientotp` (
  `phoneNumber` varchar(50) NOT NULL,
  `otp` varchar(10) DEFAULT NULL,
  `expireAt` datetime DEFAULT NULL,
  `retries` int DEFAULT '0',
  PRIMARY KEY (`phoneNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `name` varchar(50) DEFAULT NULL,
  `patient_id` varchar(100) NOT NULL,
  `patient_uid` varchar(45) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_by` varchar(45) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('M','F','O') DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `country_code` varchar(5) DEFAULT NULL,
  `email_id` varchar(45) DEFAULT NULL,
  `cardiac_history` json DEFAULT NULL,
  `referred_by` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(45) DEFAULT NULL,
  `data_updated_by` varchar(45) DEFAULT NULL,
  `data_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`patient_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prioritycenters`
--

DROP TABLE IF EXISTS `prioritycenters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prioritycenters` (
  `centerid` int NOT NULL,
  PRIMARY KEY (`centerid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `push_notification_tokens`
--

DROP TABLE IF EXISTS `push_notification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_notification_tokens` (
  `ostype` varchar(30) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `ums_user_id` varchar(45) NOT NULL,
  `product_id` varchar(45) NOT NULL,
  `fcm_token` varchar(400) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `qb_centers`
--

DROP TABLE IF EXISTS `qb_centers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qb_centers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerId` int NOT NULL DEFAULT '0',
  `data` text,
  `qbId` varchar(100) DEFAULT NULL,
  `qbdomain` int NOT NULL,
  `status` enum('ACTIVE','DEACTIVATED') NOT NULL DEFAULT 'ACTIVE',
  `UMRN` varchar(100) DEFAULT NULL,
  `ECSBank` varchar(100) DEFAULT NULL,
  `donorName` varchar(150) DEFAULT NULL,
  `basePlan` int DEFAULT '0',
  `ecsLimit` int DEFAULT NULL,
  `paymentMode` varchar(100) DEFAULT NULL,
  `ecgPaperPlanConfig` varchar(200) DEFAULT NULL,
  `ecgPaperPlanId` int DEFAULT NULL,
  `disableautoinvoice` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE` (`centerId`,`status`,`qbdomain`),
  KEY `ix_qbcenters_qbid` (`qbId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `qb_products`
--

DROP TABLE IF EXISTS `qb_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qb_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `qbCode` varchar(50) DEFAULT NULL,
  `qbdomain` int DEFAULT NULL,
  `igstCode` varchar(10) DEFAULT NULL,
  `itemId` varchar(10) DEFAULT NULL,
  `gstCode` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `qbconfig`
--

DROP TABLE IF EXISTS `qbconfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qbconfig` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `shortname` varchar(45) NOT NULL,
  `description` text,
  `currency` text,
  `realmid` varchar(45) NOT NULL,
  `oauth_token` text,
  `oauth_token_secret` text,
  `access_token` text,
  `refresh_token` text,
  `access_token_expiry_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `shortname_UNIQUE` (`shortname`),
  UNIQUE KEY `realmid_UNIQUE` (`realmid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `referral`
--

DROP TABLE IF EXISTS `referral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referral` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(40) NOT NULL,
  `cardioId` int NOT NULL,
  `referralDate` datetime DEFAULT NULL,
  `reason` varchar(50) DEFAULT NULL,
  `state` varchar(20) DEFAULT NULL,
  `seen` int DEFAULT '0',
  `spokeCenterId` int NOT NULL,
  `hubcenterid` int NOT NULL,
  `eta` varchar(20) DEFAULT NULL,
  `notes` varchar(200) DEFAULT NULL,
  `assignedHub` varchar(50) DEFAULT NULL,
  `linkedReferralId` int DEFAULT NULL,
  `billingAmount` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ecgid` (`ecgId`),
  KEY `idx_linkedreferralid_hubCenterid` (`linkedReferralId`,`hubcenterid`)
) ENGINE=InnoDB AUTO_INCREMENT=658 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `referralnotes`
--

DROP TABLE IF EXISTS `referralnotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referralnotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ecgId` varchar(50) NOT NULL,
  `centerId` int NOT NULL,
  `doctorId` int DEFAULT NULL,
  `addedBy` varchar(500) NOT NULL,
  `text` varchar(500) NOT NULL,
  `date` datetime NOT NULL,
  `fileId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `save_beat_form`
--

DROP TABLE IF EXISTS `save_beat_form`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `save_beat_form` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `clinicname` varchar(200) DEFAULT NULL,
  `agree` varchar(20) DEFAULT NULL,
  `datetime` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `selective_submission_usage`
--

DROP TABLE IF EXISTS `selective_submission_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `selective_submission_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `center_id` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `validity` int DEFAULT NULL,
  `voucher_id` varchar(50) DEFAULT NULL,
  `number_of_ecgs` int DEFAULT NULL,
  `ecgs_consumed` int DEFAULT NULL,
  `is_active` int DEFAULT NULL,
  `raised_alerts` int DEFAULT '0',
  `amount` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_audit_logs`
--

DROP TABLE IF EXISTS `system_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jsonData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_work_flow`
--

DROP TABLE IF EXISTS `task_work_flow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_work_flow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` varchar(100) NOT NULL,
  `ecg_id` varchar(40) DEFAULT NULL,
  `domain` varchar(100) DEFAULT NULL,
  `timeout` int NOT NULL DEFAULT '-1',
  `date_after_timeout` datetime DEFAULT NULL,
  `stage_sequence` tinyint NOT NULL,
  `next_task` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `diagnosis` varchar(1000) DEFAULT NULL,
  `diagnosis_status` varchar(20) DEFAULT NULL,
  `isCritical` tinyint DEFAULT NULL,
  `signature_config` json DEFAULT NULL,
  `config` json DEFAULT NULL,
  `to_atlas_msg` json DEFAULT NULL,
  `from_atlas_msg` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `task_id` (`task_id`),
  KEY `stage_sequence_idx` (`stage_sequence`),
  KEY `ecg_id_idx` (`ecg_id`),
  KEY `status_idx` (`status`),
  KEY `task_id_idx` (`task_id`),
  KEY `idx_task_work_flow_domain` (`domain`),
  KEY `started_at_idx` (`started_at`),
  CONSTRAINT `task_work_flow_ibfk_1` FOREIGN KEY (`ecg_id`) REFERENCES `data` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=13394 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `temp_patient_info`
--

DROP TABLE IF EXISTS `temp_patient_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temp_patient_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date DEFAULT NULL,
  `gender_id` tinyint NOT NULL,
  `center_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ums_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'MIGRATION',
  `patient_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=522 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `timer_active_tasks`
--

DROP TABLE IF EXISTS `timer_active_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timer_active_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` varchar(100) NOT NULL,
  `timeout_time` datetime DEFAULT NULL,
  `subject` varchar(100) DEFAULT 'STAGE_TIMEOUT',
  PRIMARY KEY (`id`),
  UNIQUE KEY `task_id_subject_idx` (`task_id`,`subject`),
  KEY `timeout_time_idx` (`timeout_time`),
  CONSTRAINT `timer_active_tasks_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `task_work_flow` (`task_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `timer_logs`
--

DROP TABLE IF EXISTS `timer_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timer_logs` (
  `task_id` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `action` varchar(40) DEFAULT NULL,
  `subject` varchar(100) DEFAULT 'STAGE_TIMEOUT',
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modified_by` varchar(255) DEFAULT NULL,
  KEY `created_at_idx` (`created_at`),
  KEY `task_id_idx` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `url_shortners`
--

DROP TABLE IF EXISTS `url_shortners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `url_shortners` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `hash` varchar(200) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url_shortners_hash_unique` (`hash`),
  UNIQUE KEY `url_shortners_url_unique` (`url`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users_pending_otp`
--

DROP TABLE IF EXISTS `users_pending_otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_pending_otp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `otp` varchar(45) DEFAULT NULL,
  `expiry_time` datetime DEFAULT NULL,
  `doctorId` varchar(45) DEFAULT NULL,
  `country_code` varchar(45) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doctorId_UNIQUE` (`doctorId`),
  KEY `idx_mobile` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=893 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vbillablecenters`
--

DROP TABLE IF EXISTS `vbillablecenters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vbillablecenters` (
  `id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vbillingplans`
--

DROP TABLE IF EXISTS `vbillingplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vbillingplans` (
  `planid` int DEFAULT NULL,
  `centerid` int DEFAULT NULL,
  `startdate` date DEFAULT NULL,
  `enddate` date DEFAULT NULL,
  `units` decimal(32,0) DEFAULT NULL,
  `planvalue` decimal(42,0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vcenterinvoices`
--

DROP TABLE IF EXISTS `vcenterinvoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vcenterinvoices` (
  `id` int DEFAULT NULL,
  `centername` varchar(255) DEFAULT NULL,
  `balance` double DEFAULT NULL,
  `totalAmount` double DEFAULT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vcenterlatestecg`
--

DROP TABLE IF EXISTS `vcenterlatestecg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vcenterlatestecg` (
  `dataid` int DEFAULT NULL,
  `acquireddate` date DEFAULT NULL,
  `acquiredtime` time DEFAULT NULL,
  `centerid` varchar(255) DEFAULT NULL,
  `deviceid` varchar(255) DEFAULT NULL,
  `ecgmachinetype` varchar(25) DEFAULT NULL,
  `macserialid` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vcentermonthly`
--

DROP TABLE IF EXISTS `vcentermonthly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vcentermonthly` (
  `id` int DEFAULT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `ecgs` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vcenteroutstanding`
--

DROP TABLE IF EXISTS `vcenteroutstanding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vcenteroutstanding` (
  `id` int DEFAULT NULL,
  `balance` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vdata`
--

DROP TABLE IF EXISTS `vdata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vdata` (
  `dataid` int DEFAULT NULL,
  `centerid` varchar(255) DEFAULT NULL,
  `acquireddate` date DEFAULT NULL,
  `acquiredtime` time DEFAULT NULL,
  `deviceid` varchar(255) DEFAULT NULL,
  `ecgMachineType` varchar(25) DEFAULT NULL,
  `macSerialId` varchar(100) DEFAULT NULL,
  `DeviceAcquisition` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vHooks`
--

DROP TABLE IF EXISTS `vHooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vHooks` (
  `transformerHook` longtext,
  `WebhookMeta` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vhubpreference`
--

DROP TABLE IF EXISTS `vhubpreference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vhubpreference` (
  `doctorLevel` int DEFAULT NULL,
  `tlasDomainId` varchar(255) DEFAULT NULL,
  `isMiddleman` int DEFAULT NULL,
  `middleManPreference` varchar(50) DEFAULT NULL,
  `ecgWebhook` varchar(200) DEFAULT NULL,
  `timeZone` varchar(100) DEFAULT NULL,
  `algoService` longtext,
  `middlemanSkipDuration` longtext,
  `deadline` longtext,
  `autoDownloadPdf` longtext,
  `spokeCenterId` int DEFAULT NULL,
  `hubCenterId` int DEFAULT NULL,
  `transformerHook` longtext,
  `webhookMeta` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vhubpreference2`
--

DROP TABLE IF EXISTS `vhubpreference2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vhubpreference2` (
  `doctorLevel` int DEFAULT NULL,
  `tlasDomainId` varchar(255) DEFAULT NULL,
  `isMiddleman` int DEFAULT NULL,
  `middleManPreference` varchar(50) DEFAULT NULL,
  `ecgWebhook` varchar(200) DEFAULT NULL,
  `timeZone` varchar(100) DEFAULT NULL,
  `middlemanSkipDuration` longtext,
  `deadline` longtext,
  `autoDownloadPdf` longtext,
  `spokeCenterId` int DEFAULT NULL,
  `hubCenterId` int DEFAULT NULL,
  `transformerHook` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vhubpreference_test`
--

DROP TABLE IF EXISTS `vhubpreference_test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vhubpreference_test` (
  `doctorLevel` int DEFAULT NULL,
  `tlasDomainId` varchar(255) DEFAULT NULL,
  `isMiddleman` int DEFAULT NULL,
  `middleManPreference` varchar(50) DEFAULT NULL,
  `ecgWebhook` varchar(200) DEFAULT NULL,
  `timeZone` varchar(100) DEFAULT NULL,
  `algoService` longtext,
  `middlemanSkipDuration` longtext,
  `deadline` longtext,
  `autoDownloadPdf` longtext,
  `spokeCenterId` int DEFAULT NULL,
  `hubCenterId` int DEFAULT NULL,
  `transformerHook` longtext,
  `webhookMeta` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vHubSpokes`
--

DROP TABLE IF EXISTS `vHubSpokes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vHubSpokes` (
  `spokeId` int DEFAULT NULL,
  `spokeName` varchar(255) DEFAULT NULL,
  `hubId` int DEFAULT NULL,
  `hubName` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `viewer_logs`
--

DROP TABLE IF EXISTS `viewer_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viewer_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `graphRenderedTime` datetime DEFAULT NULL,
  `diagnosisCompletedTime` datetime DEFAULT NULL,
  `diagnosedBy` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fullstats` json DEFAULT NULL,
  `ecgid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `viewerlogin`
--

DROP TABLE IF EXISTS `viewerlogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viewerlogin` (
  `DoctorName` varchar(50) NOT NULL,
  `Username` varchar(20) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `correctReview` int DEFAULT '0',
  `incorrectReview` int DEFAULT '0',
  `isCriticalDoctor` int DEFAULT '0',
  `phoneNumber` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `qualifications` varchar(200) DEFAULT NULL,
  `designation` varchar(200) DEFAULT NULL,
  `noSignature` int DEFAULT '0',
  `signatureImage` mediumblob,
  `registrationNumber` varchar(50) DEFAULT NULL,
  `isExternal` int DEFAULT '0',
  `token` varchar(100) DEFAULT NULL,
  `notificationid` varchar(500) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `signHash` varchar(255) DEFAULT NULL,
  `signatureId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `viewerloginstats`
--

DROP TABLE IF EXISTS `viewerloginstats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viewerloginstats` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(30) DEFAULT NULL,
  `sessionId` varchar(100) DEFAULT NULL,
  `loginTimestamp` datetime DEFAULT NULL,
  `logoutTimestamp` datetime DEFAULT NULL,
  `effectiveTime` json DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `viewerreg`
--

DROP TABLE IF EXISTS `viewerreg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viewerreg` (
  `id` int NOT NULL AUTO_INCREMENT,
  `regId` varchar(255) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `isActive` int DEFAULT NULL,
  `lastHeartBeat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `loggedDoctor` varchar(100) DEFAULT NULL,
  `isCritical` int DEFAULT '0',
  `loginTime` datetime DEFAULT NULL,
  `machineStats` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vpenultimate`
--

DROP TABLE IF EXISTS `vpenultimate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vpenultimate` (
  `centerid` varchar(255) DEFAULT NULL,
  `dataid` int DEFAULT NULL,
  `acquireddate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vQbid`
--

DROP TABLE IF EXISTS `vQbid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vQbid` (
  `centerid` int DEFAULT NULL,
  `qbid` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `zohotickets`
--

DROP TABLE IF EXISTS `zohotickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zohotickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centerid` varchar(255) DEFAULT NULL,
  `ticket_number` varchar(255) DEFAULT NULL,
  `ticket_data` json DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ticket_number` (`ticket_number`),
  KEY `idx_centerid` (`centerid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-03 19:52:10
