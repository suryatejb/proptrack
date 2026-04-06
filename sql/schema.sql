-- PropTrack schema
-- drop everything first so we can re-run cleanly
DROP TABLE IF EXISTS inspection;
DROP TABLE IF EXISTS contract;
DROP TABLE IF EXISTS offer;
DROP TABLE IF EXISTS showing_appointment;
DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS property_amenity;
DROP TABLE IF EXISTS amenity;
DROP TABLE IF EXISTS listing;
DROP TABLE IF EXISTS property;
DROP TABLE IF EXISTS buyer;
DROP TABLE IF EXISTS agent;
DROP TABLE IF EXISTS neighborhood;

-- tables

CREATE TABLE neighborhood (
    neighborhood_id   INT            AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(100)   NOT NULL,
    city              VARCHAR(100)   NOT NULL,
    state             CHAR(2)        NOT NULL,
    zip_code          VARCHAR(10)    NOT NULL,
    walkability_score DECIMAL(4,1),
    school_rating     DECIMAL(3,1),
    flood_zone        VARCHAR(10),
    median_income     DECIMAL(12,2)
) ENGINE=InnoDB;

CREATE TABLE agent (
    agent_id       INT           AUTO_INCREMENT PRIMARY KEY,
    license_number VARCHAR(50)   NOT NULL UNIQUE,
    first_name     VARCHAR(50)   NOT NULL,
    last_name      VARCHAR(50)   NOT NULL,
    email          VARCHAR(100)  NOT NULL UNIQUE,
    phone          VARCHAR(20),
    brokerage      VARCHAR(100)  NOT NULL,
    hire_date      DATE
) ENGINE=InnoDB;

CREATE TABLE buyer (
    buyer_id             INT           AUTO_INCREMENT PRIMARY KEY,
    first_name           VARCHAR(50)   NOT NULL,
    last_name            VARCHAR(50)   NOT NULL,
    email                VARCHAR(100)  NOT NULL UNIQUE,
    phone                VARCHAR(20),
    pre_approval_status  ENUM('none','pending','approved') DEFAULT 'none',
    budget_min           DECIMAL(12,2),
    budget_max           DECIMAL(12,2),
    preferences          TEXT
) ENGINE=InnoDB;

CREATE TABLE property (
    property_id     INT           AUTO_INCREMENT PRIMARY KEY,
    address         VARCHAR(200)  NOT NULL,
    city            VARCHAR(100)  NOT NULL,
    state           CHAR(2)       NOT NULL,
    zip_code        VARCHAR(10)   NOT NULL,
    square_feet     INT,
    bedrooms        TINYINT,
    bathrooms       DECIMAL(3,1),
    year_built      YEAR,
    property_type   ENUM('single_family','condo','townhouse','multi_family') NOT NULL,
    neighborhood_id INT,
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhood(neighborhood_id)
) ENGINE=InnoDB;

CREATE TABLE listing (
    listing_id      INT           AUTO_INCREMENT PRIMARY KEY,
    property_id     INT           NOT NULL,
    agent_id        INT           NOT NULL,
    list_price      DECIMAL(12,2) NOT NULL,
    status          ENUM('active','under_contract','sold','withdrawn') DEFAULT 'active',
    list_date       DATE          NOT NULL,
    expiration_date DATE,
    description     TEXT,
    FOREIGN KEY (property_id) REFERENCES property(property_id),
    FOREIGN KEY (agent_id)    REFERENCES agent(agent_id)
) ENGINE=InnoDB;

CREATE TABLE price_history (
    price_history_id INT           AUTO_INCREMENT PRIMARY KEY,
    listing_id       INT           NOT NULL,
    old_price        DECIMAL(12,2) NOT NULL,
    new_price        DECIMAL(12,2) NOT NULL,
    change_date      DATE          NOT NULL,
    change_reason    VARCHAR(200),
    FOREIGN KEY (listing_id) REFERENCES listing(listing_id)
) ENGINE=InnoDB;

CREATE TABLE amenity (
    amenity_id INT          AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    category   VARCHAR(50)
) ENGINE=InnoDB;

-- junction table for property amenities (many-to-many)
CREATE TABLE property_amenity (
    property_id INT NOT NULL,
    amenity_id  INT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES property(property_id),
    FOREIGN KEY (amenity_id)  REFERENCES amenity(amenity_id)
) ENGINE=InnoDB;

CREATE TABLE showing_appointment (
    appointment_id INT      AUTO_INCREMENT PRIMARY KEY,
    listing_id     INT      NOT NULL,
    buyer_id       INT      NOT NULL,
    agent_id       INT      NOT NULL,
    scheduled_time DATETIME NOT NULL,
    status         ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
    feedback_notes TEXT,
    FOREIGN KEY (listing_id) REFERENCES listing(listing_id),
    FOREIGN KEY (buyer_id)   REFERENCES buyer(buyer_id),
    FOREIGN KEY (agent_id)   REFERENCES agent(agent_id)
) ENGINE=InnoDB;

CREATE TABLE offer (
    offer_id        INT           AUTO_INCREMENT PRIMARY KEY,
    listing_id      INT           NOT NULL,
    buyer_id        INT           NOT NULL,
    offer_price     DECIMAL(12,2) NOT NULL,
    contingencies   TEXT,
    expiration_date DATE,
    status          ENUM('pending','accepted','rejected','expired','withdrawn') DEFAULT 'pending',
    submitted_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listing(listing_id),
    FOREIGN KEY (buyer_id)   REFERENCES buyer(buyer_id)
) ENGINE=InnoDB;

CREATE TABLE contract (
    contract_id   INT           AUTO_INCREMENT PRIMARY KEY,
    offer_id      INT           NOT NULL UNIQUE,
    listing_id    INT           NOT NULL,
    closing_date  DATE,
    final_price   DECIMAL(12,2) NOT NULL,
    earnest_money DECIMAL(12,2),
    contract_date DATE          NOT NULL,
    status        ENUM('active','closed','cancelled') DEFAULT 'active',
    FOREIGN KEY (offer_id)   REFERENCES offer(offer_id),
    FOREIGN KEY (listing_id) REFERENCES listing(listing_id)
) ENGINE=InnoDB;

CREATE TABLE inspection (
    inspection_id   INT          AUTO_INCREMENT PRIMARY KEY,
    listing_id      INT          NOT NULL,
    inspector_name  VARCHAR(100) NOT NULL,
    inspection_date DATE         NOT NULL,
    result          ENUM('pass','fail','conditional') NOT NULL,
    issues_found    TEXT,
    report_url      VARCHAR(255),
    FOREIGN KEY (listing_id) REFERENCES listing(listing_id)
) ENGINE=InnoDB;


-- seed data

INSERT INTO neighborhood (name, city, state, zip_code, walkability_score, school_rating, flood_zone, median_income) VALUES
('Shadyside',     'Pittsburgh',    'PA', '15232',  88.0, 8.5, 'X',    95000.00),
('Squirrel Hill', 'Pittsburgh',    'PA', '15217',  91.0, 9.2, 'X',   105000.00),
('Oakland',       'Pittsburgh',    'PA', '15213',  85.0, 7.8, 'X',    62000.00),
('Mt. Lebanon',   'Pittsburgh',    'PA', '15228',  72.0, 9.0, 'None', 115000.00),
('Cranberry Twp', 'Cranberry Twp', 'PA', '16066',  45.0, 8.7, 'None', 98000.00);

INSERT INTO agent (license_number, first_name, last_name, email, phone, brokerage, hire_date) VALUES
('PA-RE-001234', 'John',   'Smith',   'john.smith@remax.com',      '412-555-0101', 'RE/MAX',          '2018-03-15'),
('PA-RE-002345', 'Sarah',  'Lee',     'sarah.lee@coldwell.com',    '412-555-0202', 'Coldwell Banker', '2020-07-01'),
('PA-RE-003456', 'Mike',   'Johnson', 'mike.johnson@kw.com',       '412-555-0303', 'Keller Williams', '2017-11-20'),
('PA-RE-004567', 'Emily',  'Davis',   'emily.davis@century21.com', '412-555-0404', 'Century 21',      '2019-05-10'),
('PA-RE-005678', 'Robert', 'Brown',   'robert.brown@hh.com',       '412-555-0505', 'Howard Hanna',    '2015-08-22'),
('PA-RE-006789', 'Lisa',   'Chen',    'lisa.chen@compass.com',     '412-555-0606', 'Compass',         '2021-02-14');

INSERT INTO buyer (first_name, last_name, email, phone, pre_approval_status, budget_min, budget_max, preferences) VALUES
('Alice', 'Walker',   'alice.walker@email.com',   '412-555-1001', 'approved', 200000.00, 300000.00, '3 bedrooms, close to parks'),
('Bob',   'Martinez', 'bob.martinez@email.com',   '412-555-1002', 'approved', 300000.00, 450000.00, 'Good school district, garage'),
('Carol', 'Nguyen',   'carol.nguyen@email.com',   '412-555-1003', 'approved', 450000.00, 600000.00, 'Large yard, modern kitchen'),
('David', 'Kim',      'david.kim@email.com',       '412-555-1004', 'pending',  150000.00, 250000.00, 'Low maintenance, close to transit'),
('Eve',   'Thompson', 'eve.thompson@email.com',    '412-555-1005', 'approved', 500000.00, 750000.00, 'Pool preferred, quiet street'),
('Frank', 'Wilson',   'frank.wilson@email.com',    '412-555-1006', 'none',     250000.00, 400000.00, 'Open floor plan, home office');

INSERT INTO property (address, city, state, zip_code, square_feet, bedrooms, bathrooms, year_built, property_type, neighborhood_id) VALUES
('123 Amberson Ave',  'Pittsburgh',    'PA', '15232', 1800, 3, 2.0, 1995, 'single_family', 1),
('456 Murray Ave',    'Pittsburgh',    'PA', '15217', 2200, 4, 2.5, 2001, 'single_family', 2),
('789 Forbes Ave',    'Pittsburgh',    'PA', '15213',  950, 2, 1.0, 1968, 'condo',         3),
('101 Washington Rd', 'Pittsburgh',    'PA', '15228', 3100, 5, 3.0, 2008, 'single_family', 4),
('202 Freedom Rd',    'Cranberry Twp', 'PA', '16066', 2500, 4, 2.5, 2015, 'single_family', 5),
('55 Beacon St',      'Pittsburgh',    'PA', '15232', 1600, 3, 2.0, 1988, 'townhouse',     1),
('310 Shady Ave',     'Pittsburgh',    'PA', '15217', 1400, 2, 2.0, 2005, 'condo',         2);

INSERT INTO listing (property_id, agent_id, list_price, status, list_date, expiration_date, description) VALUES
(1, 1, 289000.00, 'active',         '2026-01-10', '2026-07-10', 'Charming 3BR in Shadyside, updated kitchen and bath.'),
(2, 2, 425000.00, 'under_contract', '2025-11-15', '2026-05-15', 'Spacious 4BR in Squirrel Hill, great school district.'),
(3, 3, 199000.00, 'active',         '2026-02-01', '2026-08-01', 'Cozy condo in Oakland, ideal for professionals.'),
(4, 4, 575000.00, 'sold',           '2025-09-01', '2026-03-01', 'Stunning 5BR in Mt. Lebanon, premium finishes throughout.'),
(5, 5, 349000.00, 'under_contract', '2026-01-20', '2026-07-20', 'Modern 4BR in Cranberry Twp, like-new condition.'),
(6, 6, 259000.00, 'sold',           '2025-10-05', '2026-04-05', 'Updated townhouse in Shadyside, private patio.'),
(7, 1, 315000.00, 'under_contract', '2026-02-15', '2026-08-15', '2BR condo in Squirrel Hill, open floor plan.');

INSERT INTO price_history (listing_id, old_price, new_price, change_date, change_reason) VALUES
(1, 299000.00, 289000.00, '2026-02-01', 'Price reduction to attract offers'),
(2, 445000.00, 425000.00, '2025-12-10', 'Adjusted after initial market feedback'),
(3, 209000.00, 199000.00, '2026-02-20', 'Competitive market adjustment'),
(4, 599000.00, 575000.00, '2025-10-15', 'Seller motivated to close before year-end'),
(5, 359000.00, 349000.00, '2026-02-10', 'Strategic repositioning after showing feedback'),
(6, 269000.00, 259000.00, '2025-11-01', 'Price drop to match comparable sales');

INSERT INTO amenity (name, category) VALUES
('Swimming Pool',   'outdoor'),
('Garage',          'parking'),
('Fireplace',       'interior'),
('Central AC',      'interior'),
('Hardwood Floors', 'interior'),
('Backyard',        'outdoor');

INSERT INTO property_amenity (property_id, amenity_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 5),
(3, 4), (3, 5),
(4, 1), (4, 2);

INSERT INTO showing_appointment (listing_id, buyer_id, agent_id, scheduled_time, status, feedback_notes) VALUES
(1, 1, 1, '2026-02-15 10:00:00', 'scheduled',  NULL),
(2, 2, 2, '2026-01-20 14:00:00', 'completed',  'Loved the kitchen and backyard space.'),
(3, 4, 3, '2026-02-22 11:00:00', 'completed',  'Concerned about size but liked the location.'),
(4, 3, 4, '2025-10-20 15:00:00', 'completed',  'Perfect layout, ready to make an offer.'),
(5, 5, 5, '2026-03-01 09:00:00', 'scheduled',  NULL),
(6, 6, 6, '2025-11-10 13:00:00', 'completed',  'Good value for the price, minor repairs noticed.');

INSERT INTO offer (listing_id, buyer_id, offer_price, contingencies, expiration_date, status, submitted_at) VALUES
(2, 2, 420000.00, 'Financing and inspection contingency', '2026-02-28', 'accepted',  '2026-01-25 09:00:00'),
(4, 3, 572000.00, 'Inspection contingency',               '2025-11-20', 'accepted',  '2025-11-01 10:30:00'),
(6, 6, 255000.00, 'None',                                 '2025-11-30', 'accepted',  '2025-11-15 14:00:00'),
(7, 1, 310000.00, 'Financing contingency',                '2026-03-15', 'accepted',  '2026-03-01 11:00:00'),
(1, 4, 283000.00, 'Financing contingency',                '2026-03-25', 'pending',   '2026-03-10 15:00:00'),
(3, 4, 193000.00, 'None',                                 '2026-03-10', 'rejected',  '2026-02-25 16:00:00'),
(5, 5, 344000.00, 'Inspection contingency',               '2026-03-20', 'accepted',  '2026-03-05 08:00:00');

INSERT INTO contract (offer_id, listing_id, closing_date, final_price, earnest_money, contract_date, status) VALUES
(1, 2, '2026-03-15', 420000.00,  8400.00, '2026-01-26', 'active'),
(2, 4, '2026-01-10', 572000.00, 11440.00, '2025-11-02', 'closed'),
(3, 6, '2025-12-20', 255000.00,  5100.00, '2025-11-16', 'closed'),
(4, 7, '2026-04-15', 310000.00,  6200.00, '2026-03-02', 'active'),
(7, 5, '2026-04-30', 344000.00,  6880.00, '2026-03-06', 'active');

INSERT INTO inspection (listing_id, inspector_name, inspection_date, result, issues_found, report_url) VALUES
(2, 'James Hoover', '2026-02-01', 'pass',        NULL,                                               NULL),
(4, 'Mary Quinn',   '2025-10-10', 'conditional', 'Minor roof wear; recommend sealing within 1 year', NULL),
(6, 'Tom Bradley',  '2025-11-05', 'pass',        NULL,                                               NULL),
(1, 'Sandra Patel', '2026-02-20', 'pass',        NULL,                                               NULL),
(3, 'Kevin Okafor', '2026-02-25', 'conditional', 'Aging plumbing; HVAC service overdue',             NULL),
(7, 'James Hoover', '2026-03-05', 'pass',        NULL,                                               NULL);


-- indexes
-- status and agent are the most common filters/joins on listings
CREATE INDEX idx_listing_status ON listing(status);
CREATE INDEX idx_listing_agent ON listing(agent_id);
CREATE INDEX idx_listing_date ON listing(list_date);

-- neighborhood lookup happens on every property search
CREATE INDEX idx_property_nbhd ON property(neighborhood_id);

-- email is used to look up agents and buyers
CREATE INDEX idx_agent_email ON agent(email);
CREATE INDEX idx_buyer_email ON buyer(email);

CREATE INDEX idx_showing_time ON showing_appointment(scheduled_time);
CREATE INDEX idx_offer_listing ON offer(listing_id);
CREATE INDEX idx_offer_status ON offer(status);


-- views

-- shows active listings joined with neighborhood info and agent contact
-- used on the property search page
CREATE OR REPLACE VIEW active_listings_with_neighborhood AS
SELECT
    l.listing_id,
    l.list_price,
    l.list_date,
    l.description,
    p.address,
    p.city,
    p.zip_code,
    p.square_feet,
    p.bedrooms,
    p.bathrooms,
    p.year_built,
    p.property_type,
    n.name              AS neighborhood_name,
    n.walkability_score,
    n.school_rating,
    n.flood_zone,
    CONCAT(a.first_name, ' ', a.last_name) AS agent_name,
    a.phone             AS agent_phone,
    a.email             AS agent_email
FROM listing l
JOIN property     p ON l.property_id     = p.property_id
JOIN neighborhood n ON p.neighborhood_id = n.neighborhood_id
JOIN agent        a ON l.agent_id        = a.agent_id
WHERE l.status = 'active';


-- average days on market per agent, based on closed contracts
-- used in the agent performance report
CREATE OR REPLACE VIEW agent_days_on_market AS
SELECT
    a.agent_id,
    CONCAT(a.first_name, ' ', a.last_name)              AS agent_name,
    a.brokerage,
    COUNT(l.listing_id)                                  AS total_closed,
    ROUND(AVG(DATEDIFF(c.closing_date, l.list_date)), 1) AS avg_days_on_market,
    MIN(DATEDIFF(c.closing_date, l.list_date))           AS min_days,
    MAX(DATEDIFF(c.closing_date, l.list_date))           AS max_days
FROM agent a
JOIN listing  l ON a.agent_id   = l.agent_id
JOIN contract c ON l.listing_id = c.listing_id
WHERE c.status = 'closed'
GROUP BY a.agent_id, a.first_name, a.last_name, a.brokerage;


-- transaction: accepting an offer
-- scenario: a buyer submits an accepted offer on a listing.
-- both the offer record and the listing status update must succeed together.
-- if the listing is no longer active (already under contract or sold),
-- the offer insert is rolled back so we never record an accepted offer
-- against a listing that wasn't available.

DROP PROCEDURE IF EXISTS accept_offer;

DELIMITER $$

CREATE PROCEDURE accept_offer(
    IN p_listing_id      INT,
    IN p_buyer_id        INT,
    IN p_offer_price     DECIMAL(12,2),
    IN p_contingencies   TEXT,
    IN p_expiration_date DATE
)
BEGIN
    DECLARE rows_updated INT DEFAULT 0;

    -- start the atomic unit
    START TRANSACTION;

    -- step 1: insert the accepted offer
    INSERT INTO offer (listing_id, buyer_id, offer_price, contingencies, expiration_date, status, submitted_at)
    VALUES (p_listing_id, p_buyer_id, p_offer_price, p_contingencies, p_expiration_date, 'accepted', NOW());

    -- step 2: flip the listing to under_contract only if it is still active
    UPDATE listing
    SET status = 'under_contract'
    WHERE listing_id = p_listing_id AND status = 'active';

    SET rows_updated = ROW_COUNT();

    -- step 3: if the listing was not active, roll back both changes
    IF rows_updated = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Listing is not active — offer rejected and transaction rolled back.';
    ELSE
        COMMIT;
        SELECT LAST_INSERT_ID() AS offer_id;
    END IF;
END$$

DELIMITER ;
