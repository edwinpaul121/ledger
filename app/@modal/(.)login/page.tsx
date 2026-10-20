import LoginModal from "@/components/LoginModal";
import AuthForm from "@/components/AuthForm";

export default function InterceptedLoginPage() {
  return (
    <LoginModal>
      <AuthForm />
    </LoginModal>
  );
}
