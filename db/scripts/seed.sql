-- Seed

INSERT INTO country (id, name) VALUES
(3,'Algeria'),
(30,'Brazil'),
(31,'British Indian Ocean Territory'),
(61,'East Timor'),
(74,'France, Metropolitan'),
(77,'French Southern Territories'),
(84,'Guernsey'),
(95,'Heard and Mc Donald Islands'),
(101,'Isle of Man'),
(108,'Ivory Coast'),
(109,'Jersey'),
(118,'Kosovo'),
(121,'Lao Peoples Democratic Republic'),
(126,'Libyan Arab Jamahiriya'),
(131,'North Macedonia'),
(181,'Reunion'),
(190,'Sao Tome and Principe'),
(202,'South Georgia South Sandwich Islands'),
(206,'St. Helena'),
(207,'St. Pierre and Miquelon'),
(208,'Sudan'),
(233,'United States minor outlying islands'),
(237,'Vatican City State'),
(243,'Western Sahara'),
(1,'Afghanistan'),
(2,'Albania'),
(4,'American Samoa'),
(5,'Andorra'),
(6,'Angola'),
(7,'Anguilla'),
(8,'Antarctica'),
(9,'Antigua and Barbuda'),
(10,'Argentina'),
(11,'Armenia'),
(12,'Aruba'),
(13,'Australia'),
(14,'Austria'),
(15,'Azerbaijan'),
(16,'Bahamas'),
(17,'Bahrain'),
(18,'Bangladesh'),
(19,'Barbados'),
(20,'Belarus'),
(21,'Belgium'),
(22,'Belize'),
(23,'Benin'),
(24,'Bermuda'),
(25,'Bhutan'),
(26,'Bolivia'),
(27,'Bosnia and Herzegovina'),
(28,'Botswana'),
(29,'Bouvet Island'),
(32,'Brunei Darussalam'),
(33,'Bulgaria'),
(34,'Burkina Faso'),
(35,'Burundi'),
(36,'Cambodia'),
(37,'Cameroon'),
(38,'Canada'),
(39,'Cape Verde'),
(40,'Cayman Islands'),
(41,'Central African Republic'),
(42,'Chad'),
(43,'Chile'),
(44,'China'),
(45,'Christmas Island'),
(46,'Cocos (Keeling) Islands'),
(47,'Colombia'),
(48,'Comoros'),
(50,'Republic of Congo'),
(49,'Democratic Republic of the Congo'),
(51,'Cook Islands'),
(52,'Costa Rica'),
(53,'Croatia (Hrvatska)'),
(54,'Cuba'),
(55,'Cyprus'),
(56,'Czech Republic'),
(57,'Denmark'),
(58,'Djibouti'),
(59,'Dominica'),
(60,'Dominican Republic'),
(62,'Ecuador'),
(63,'Egypt'),
(64,'El Salvador'),
(65,'Equatorial Guinea'),
(66,'Eritrea'),
(67,'Estonia'),
(68,'Ethiopia'),
(69,'Malvinas Islands'),
(70,'Faroe Islands'),
(71,'Fiji'),
(72,'Finland'),
(73,'France'),
(75,'French Guiana'),
(76,'French Polynesia'),
(78,'Gabon'),
(79,'Gambia'),
(80,'Georgia'),
(81,'Germany'),
(82,'Ghana'),
(83,'Gibraltar'),
(85,'Greece'),
(86,'Greenland'),
(87,'Grenada'),
(88,'Guadeloupe'),
(89,'Guam'),
(90,'Guatemala'),
(91,'Guinea'),
(92,'Guinea-Bissau'),
(93,'Guyana'),
(94,'Haiti'),
(96,'Honduras'),
(97,'Hong Kong'),
(98,'Hungary'),
(99,'Iceland'),
(100,'India'),
(102,'Indonesia'),
(103,'(Islamic Republic of) Iran'),
(104,'Iraq'),
(105,'Ireland'),
(106,'Israel'),
(107,'Italy'),
(110,'Jamaica'),
(111,'Japan'),
(112,'Jordan'),
(113,'Kazakhstan'),
(114,'Kenya'),
(115,'Kiribati'),
(117,'Republic of Korea'),
(116,'Democratic Peoples Republic of Korea'),
(119,'Kuwait'),
(120,'Kyrgyzstan'),
(122,'Latvia'),
(123,'Lebanon'),
(124,'Lesotho'),
(125,'Liberia'),
(127,'Liechtenstein'),
(128,'Lithuania'),
(129,'Luxembourg'),
(130,'Macau'),
(132,'Madagascar'),
(133,'Malawi'),
(134,'Malaysia'),
(135,'Maldives'),
(136,'Mali'),
(137,'Malta'),
(138,'Marshall Islands'),
(139,'Martinique'),
(140,'Mauritania'),
(141,'Mauritius'),
(142,'Mayotte'),
(143,'Mexico'),
(144,'Federated States of Micronesia'),
(145,'Republic of Moldova'),
(146,'Monaco'),
(147,'Mongolia'),
(148,'Montenegro'),
(149,'Montserrat'),
(150,'Morocco'),
(151,'Mozambique'),
(152,'Myanmar'),
(153,'Namibia'),
(154,'Nauru'),
(155,'Nepal'),
(156,'Netherlands'),
(157,'Netherlands Antilles'),
(158,'New Caledonia'),
(159,'New Zealand'),
(160,'Nicaragua'),
(161,'Niger'),
(162,'Nigeria'),
(163,'Niue'),
(164,'Norfolk Island'),
(165,'Northern Mariana Islands'),
(166,'Norway'),
(167,'Oman'),
(168,'Pakistan'),
(169,'Palau'),
(170,'Palestine'),
(171,'Panama'),
(172,'Papua New Guinea'),
(173,'Paraguay'),
(174,'Peru'),
(175,'Philippines'),
(176,'Pitcairn'),
(177,'Poland'),
(178,'Portugal'),
(179,'Puerto Rico'),
(180,'Qatar'),
(182,'Romania'),
(183,'Russian Federation'),
(184,'Rwanda'),
(185,'Saint Kitts and Nevis'),
(186,'Saint Lucia'),
(187,'Saint Vincent and the Grenadines'),
(188,'Samoa'),
(189,'San Marino'),
(191,'Saudi Arabia'),
(192,'Senegal'),
(193,'Serbia'),
(194,'Seychelles'),
(195,'Sierra Leone'),
(196,'Singapore'),
(197,'Slovakia'),
(198,'Slovenia'),
(199,'Solomon Islands'),
(200,'Somalia'),
(201,'South Africa'),
(204,'Spain'),
(205,'Sri Lanka'),
(203,'South Sudan'),
(209,'Suriname'),
(210,'Svalbard and Jan Mayen Islands'),
(211,'Swaziland'),
(212,'Sweden'),
(213,'Switzerland'),
(214,'Syrian Arab Republic'),
(215,'Taiwan'),
(216,'Tajikistan'),
(217,'United Republic of Tanzania'),
(218,'Thailand'),
(219,'Togo'),
(220,'Tokelau'),
(221,'Tonga'),
(222,'Trinidad and Tobago'),
(223,'Tunisia'),
(224,'Turkey'),
(225,'Turkmenistan'),
(226,'Turks and Caicos Islands'),
(227,'Tuvalu'),
(228,'Uganda'),
(229,'Ukraine'),
(230,'United Arab Emirates'),
(231,'United Kingdom'),
(232,'United States'),
(234,'Uruguay'),
(235,'Uzbekistan'),
(236,'Vanuatu'),
(238,'Venezuela'),
(239,'Vietnam'),
(240,'Virgin Islands (British)'),
(241,'Virgin Islands (U.S.)'),
(242,'Wallis and Futuna Islands'),
(244,'Yemen'),
(245,'Zambia'),
(246,'Zimbabwe');

INSERT INTO "role"(description) 
VALUES ('beneficiary'), ('investor'), ('auditor');

INSERT INTO "token"(name, symbol, "apiBaseUrl", "contractAddress") 
VALUES ('ETH', 'ETH', 18, 'https://blockscout.com/eth/mainnet/api', NULL),
('ETC', 'ETC', 18, 'https://blockscout.com/etc/mainnet/api', NULL),
('Tether USD', 'USDT',  6, 'https://blockscout.com/eth/mainnet/api', '0xdAC17F958D2ee523a2206206994597C13D831ec7'),
('RBTC', 'RBTC', 18, 'https://blockscout.com/rsk/mainnet/api', NULL);