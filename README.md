[@FirePh0enix]: https://github.com/FirePh0enix
[@Vpekdas]: https://github.com/Vpekdas
[@Lebronen]: https://github.com/Lebronen

# ft_transcendence

## Table of Contents
1. [Description](#description)
2. [Installation](#installation)
3. [Run](#run)
4. [Credits](#credits)
5. [Contributing](#contributing)

## Description

https://github.com/user-attachments/assets/f4f744f3-2143-43fd-bb6b-bac6e26581ce

ft_transcendence is a project from the 42 Common Core curriculum. The goal is to create a Single Page Application (SPA) that includes core features such as a Pong game, a tournament system, and user login/registration management and some additional features are added to enhance the user experience. The project allows the use of Django and Bootstrap as frameworks, but forbids libraries like React or other tools that abstract away most of the development work.

To validate the project, some features were considered major, while others were deemed minor based on their workload and complexity. Below, you can find the list of features.

| **Feature** | **Authors** |
|:-----------:|-------------|
| **Web: Django (major)** | [@FirePh0enix] |
| **Web: Bootstrap (minor)** | [@Vpekdas] |
| **Web: PostgreSQL (minor)** | [@FirePh0enix] |
| **User: Standard user (major)o** | [@FirePh0enix] |
| **User: Remote Authentication (42) (major)** | [@FirePh0enix] |
| **Gameplay: Remote players (major)** | [@FirePh0enix] |
| **Gameplay: Game customization (minor)** | [@FirePh0enix] and [@Vpekdas] |
| **Gameplay: Live Chat (major)** | [@Lebronen] and [@Vpekdas] |
| **AI: User stats (minor)** | [@FirePh0enix] |
| **Cybersec: 2FA (major)** | [@Lebronen] and [@FirePh0enix] |
| **Graphics: ThreeJS (major** | [@Vpekdas] |
| **Accessibility: Expanding Browser Compatibility (minor)** | [@Vpekdas] |
| **Accessibility: Multiple language (minor)** | [@Vpekdas] and [@FirePh0enix]|

### Purpose

The website is locally hosted using Vite. Each required service runs in its own Docker container, making the setup modular and isolated. This allows you to run the full application including the Pong game and all other features directly from your local machine with no external dependencies.

## Technologies used

- **Django (Python)** – Handles server-side logic, APIs, and database interactions.
- **JavaScript, HTML, CSS (Bootstrap)** – Builds a responsive and interactive user interface.
- **Vite** – Provides fast frontend bundling and development tooling.
- **PostgreSQL** – Stores and manages structured relational data.
- **Docker** – Containerizes the app for consistent development and deployment.
- **Nginx** – Serves static files and acts as a reverse proxy to the backend.

### Challenges and Future Features

As I was responsible for the frontend and had already practiced JavaScript, the main challenges included understanding how a Single Page Application (SPA) functions, how APIs work, and how to create both efficient and visually appealing components. Additionally, I worked on mastering CSS animations to make the website more intereactive and cool.

I'm not planning to add new features.

## Installation

- Ensure [Docker](https://www.docker.com/) is installed. You can verify this running the command below.
```bash
docker --version
```
- Make sure you have created a .env at roots of the project. You can find an env example is same folder.

## Run

1. Build and start the containers:
```bash
docker-compose up
```

2. Access the application:
Open your browser and go to `https://localhost:8080` to access the website and start using the features.

I primarily code using the Arc browser, but the application is generally compatible with most modern browsers. However, it's worth noting that the particle system behaves strangely on browsers other than Arc.

## Credits

- [@FirePh0enix]: Lead backend developer, contributed to Web (Django, PostgreSQL), User features, Gameplay, AI, and Cybersecurity.
- [@Vpekdas]: Lead frontend developer, contributed to Graphics (ThreeJS), Accessibility, Gameplay, and Web (Bootstrap).
- [@Lebronen]: Backend developer, contributed to Gameplay (Live Chat) and Cybersecurity (2FA).

## Contributing

To report issues, please create an issue here:  [issue tracker](https://github.com/Vpekdas/philosophers/issues).

To contribute, follow these steps:

1. **Fork the repository**: Start by forking the repository to your own GitHub account.

2. **Clone the repository**: Clone the forked repository to your local machine.
```bash
git clone https://github.com/Vpekdas/ft_transcendence
```

3. **Create a new branch**: Create a new branch for each feature or bug fix you're working on.
```bash
git checkout -b your-branch-name
```

4. **Commit your changes**: Commit your changes.
```bash
git commit -m "Your commit message"
```

5. **Push your changes**: Push your changes to your forked repository on GitHub.
```bash
git push origin your-branch-name
```

6. **Create a pull request**: Go to your forked repository on GitHub and create a new pull request against the master branch.
