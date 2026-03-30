import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login - Shopee",
};

export default function LoginPage() {
  return (
    <>
      <Header variant="login" />
      <main
        className="flex-grow flex items-center justify-center relative bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1400&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px]" />
        <div className="relative z-10 w-full max-w-[400px] mx-4 my-12">
          <div className="bg-surface-container-lowest shadow-lg rounded-sm p-8 md:p-10">
            <h1 className="text-xl font-medium mb-8 text-on-surface">Login</h1>
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
