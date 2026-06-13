import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-2xl">K</span>
          </div>
          <h1 className="text-4xl font-bold">Krystle</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Your AI-powered job discovery copilot. Find relevant opportunities,
          get matched to your skills, and never miss the perfect role.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6 pt-12">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-primary font-bold">AI</span>
            </div>
            <h3 className="font-semibold">Smart Matching</h3>
            <p className="text-sm text-muted-foreground">
              AI scores jobs against your profile and preferences
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-primary font-bold">GH</span>
            </div>
            <h3 className="font-semibold">GitHub Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Automatically detects your skills from repositories
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-primary font-bold">HU</span>
            </div>
            <h3 className="font-semibold">Human in the Loop</h3>
            <p className="text-sm text-muted-foreground">
              You approve every application. No auto-apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
