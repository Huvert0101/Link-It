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
