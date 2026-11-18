import { createFileRoute, redirect } from "@tanstack/react-router";

// Старый адрес страницы для частных клиентов: постоянное перенаправление на /private
export const Route = createFileRoute("/home")({
  beforeLoad: () => {
    throw redirect({ to: "/private", statusCode: 301 });
  },
});
