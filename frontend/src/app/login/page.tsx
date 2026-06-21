import LoginClient from "./LoginClient";

type LoginPageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialTab = params?.tab === "register" ? "register" : "login";

  return <LoginClient initialTab={initialTab} />;
}
