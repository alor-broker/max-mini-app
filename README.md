# AstrasMiniApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.1.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Architecture

Проект построен по принципу монорепозитория. В папке projects содержатся проекты библиотек (имеют суффикс -lib) и проект приложения (tg-app).
Рассмотрим подробнее предназначение каждого проекта.

### api-lib
Данный проект инкапсулирует в себе сервисы для работы с API. Он не должен иметь никаких зависимостей от других проектов. В дальнейшем эта библиотека будет использована в проекте ASTRAS.

### environment-services-lib
Данный проект содержит абстракции для взаимодействия с хост-приложением.
Для каждой используемой фичи хост-приложения необходимо создать абстрактный класс, который описывает контракт для взаимодействия с ней (см. theming-service.ts).
Контракт **не должен просто копировать предоставляемые хостом функции**, а иметь интерфейс, удобный для использования в нашем приложении.
Используемые при этом модели следует помещать в располагающийся рядом файл *feature*-service.models.ts.

Данный проект не должен иметь никаких зависимостей от других проектов.

### shared-components-lib
Здесь располагаются компоненты, которые можно использовать в разных приложениях.
Это значит, что он может иметь зависимости от api-lib и environment-services-lib, но не должен иметь никаких зависимостей от конкретных приложений (tg-app).
Все ссылки на используемые сервисы из environment-services-lib должны осуществляться через объявленные там абстракции.

### tg-app

Приложение для telegram. Данный проект может ссылаться на любой другой lib-проект.

В папке tg-app/src/environment-services/tg содержаться используемые данным приложением реализации для сервисов, объявленных в environment-services-lib.
При этом следует соблюдать структуру папок из environment-services-lib. Т.е. если в environment-services-lib сервис объявлен в поддиректории src/theming, то и реализация должна размещаться в */tg/theming.
Каждая реализация должна:
1. расширять (наследовать) соответствующую абстракцию
2. иметь соответствующий provider в файле */tg-app/src/environment-services/tg/**environment-services-providers.ts**

## Важно!
1. Все видимые из вне части lib-проекта должны быть указаны в public-api.ts файле
2. Нужно следить, чтобы IDE корректно проставлялись import на lib-проекты. Import должен быть вид @lib-project-name


