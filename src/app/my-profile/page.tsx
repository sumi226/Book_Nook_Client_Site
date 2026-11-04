import AuthGuard from "@/components/auth/AuthGuard";
import ProfileCard from "@/components/auth/ProfileCard";

export const metadata = { title: "My Profile" };

export default function MyProfilePage() {
  return <AuthGuard><ProfileCard /></AuthGuard>;
}
