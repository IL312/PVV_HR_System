# HRS

## Настройка БД

1. Включить PGAdmin

2. Выбрать Services -> Register -> Server

- Name: hr_system
- Host name: localhost
- Password: postgres

3. Выбрать hr_system -> Databases -> Create -> Database

- Database: hr_system

4. Выбрать hr_system -> Query Tool

- Скопировать код, начиная с 8 строки, в файле server/src/schema.sql

## Подготовка БД

1. Открыть терминал и перейти в папку server.
2. Выполнить команду `npm run seed`.

## Запуск сервера

1. Открыть терминал и перейти в папку server.
2. Выполнить команду `npm i`, если не отсутствует папка node_modules.
3. Выполнить команду `npm run dev`.

## Запуск клиента

1. Открыть второй терминал и перейти в папку client.
2. Выполнить команду `npm i`, если не отсутствует папка node_modules.
3. Выполнить команду `npm run dev`.
