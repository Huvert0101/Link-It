CREATE DATABASE IF NOT EXISTS linkit;
GRANT ALL PRIVILEGES ON linkit.* TO 'link_it_user'@'%';
FLUSH PRIVILEGES;
use linkit;

create table users(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user varchar(30) NOT NULL,
    password varchar(40) NOT NULL
);

create table if not exists messages(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    message varchar(255) NOT NULL,
    type varchar(10) NOT NULL,
    user varchar(30) NOT NULL,
    folder varchar(30) NOT NULL
);

create table if not exists folders(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user varchar(30) NOT NULL,
    folder varchar(30) NOT NULL
);

create table if not exists backgrounds(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user varchar(40) NOT NULL,
    bg_src varchar(200) NOT NULL,
    active tinyint NOT NULL
);
