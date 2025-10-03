import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, MessageSquare, FileText, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/chat");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-accent/80 to-secondary/90" />
        
        <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
          <GraduationCap className="w-24 h-24 mx-auto mb-6 animate-pulse" />
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Your Personal
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Academic Advisor
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            AI-powered guidance to help you navigate your academic journey and career path with confidence
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 shadow-glow"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-primary bg-clip-text text-transparent">
            Powerful Features for Your Success
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-glow transition-shadow">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">AI-Powered Chat</h3>
              <p className="text-muted-foreground">
                Get instant, personalized guidance based on your unique profile, interests, and academic goals.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-glow transition-shadow">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Document Analysis</h3>
              <p className="text-muted-foreground">
                Upload your transcripts, resumes, or research papers for personalized insights and recommendations.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-glow transition-shadow">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Career Guidance</h3>
              <p className="text-muted-foreground">
                Discover career paths aligned with your skills and interests, with actionable steps to reach your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Shape Your Future?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students making informed decisions about their academic and career paths.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-glow"
          >
            Start Your Journey
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
