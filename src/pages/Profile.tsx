import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    academic_level: "",
    interests: [] as string[],
    skills: [] as string[],
    academic_scores: {} as any,
  });
  const [interestInput, setInterestInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          academic_level: data.academic_level || "",
          interests: data.interests || [],
          skills: data.skills || [],
          academic_scores: data.academic_scores || {},
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...profile,
        });

      if (error) throw error;
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      setProfile({ ...profile, interests: [...profile.interests, interestInput.trim()] });
      setInterestInput("");
    }
  };

  const removeInterest = (index: number) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((_, i) => i !== index),
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto p-6 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chat
          </Button>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent">
                Your Profile
              </CardTitle>
              <CardDescription>
                Help us personalize your academic guidance by sharing more about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="academic-level">Academic Level</Label>
                  <Select
                    value={profile.academic_level}
                    onValueChange={(value) => setProfile({ ...profile, academic_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your academic level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Interests</Label>
                  <div className="flex gap-2">
                    <Input
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      placeholder="Add an interest (e.g., Computer Science)"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                    />
                    <Button type="button" onClick={addInterest}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                      >
                        {interest}
                        <button
                          onClick={() => removeInterest(idx)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill (e.g., Python Programming)"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(idx)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Profile;
