create database linkit;

create table users(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user varchar(30) NOT NULL,
    password varchar(40) NOT NULL
);

create table messages(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    message varchar(255) NOT NULL,
    type varchar(10) NOT NULL,
    user varchar(30) NOT NULL,
    folder varchar(30) NOT NULL
);

create table folders(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user varchar(30) NOT NULL,
    folder varchar(30) NOT NULL
);

create table backgrounds(
    id int PRIAMRY KEY NOT NULL AUTO_INCREMENT,
    user varchar(40) NOT NULL,
    bg_src varchar(200) NOT NULL,
    active tinyint NOT NULL
);

CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user varchar(200) NOT NULL, 
    title VARCHAR(255) NULL,
    descr TEXT NULL,
    metadata JSON NULL, 
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_contenido CHECK (title IS NOT NULL OR descr IS NOT NULL)
);
