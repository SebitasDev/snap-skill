import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { useWalletAccount } from "../hooks/useWalletAccount";
import { useToast } from "../hooks/use-toast";
import { CheckCircle2, User, Upload, Plus, X } from "lucide-react";
import { Badge } from "../components/ui/badge";

const Profile = () => {
  const { user } = useWalletAccount();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/${user}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setName(data.profile.name);
            setBio(data.profile.bio);
            setSkills(data.profile.skills || []);
            setImagePreview(data.profile.imageUrl);
            setWhatsapp(data.profile.whatsapp || "");
            setTelegram(data.profile.telegram || "");
            setIsEditing(true);
          }
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user, API_BASE_URL]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!name || !bio) {
      toast({
        title: "Missing fields",
        description: "Name and Bio are required",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile && !imagePreview) {
      toast({
        title: "Missing image",
        description: "Profile image is required",
        variant: "destructive",
      });
      return;
    }

    if (!whatsapp.trim() && !telegram.trim()) {
      toast({
        title: "Missing contact info",
        description: "At least one contact method (WhatsApp or Telegram) is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("walletAddress", user);
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("skills", JSON.stringify(skills));
      formData.append("whatsapp", whatsapp);
      formData.append("telegram", telegram);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: method,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      toast({
        title: "Success",
        description: `Profile ${isEditing ? 'updated' : 'created'} successfully`,
      });

      // Update state to editing mode after successful create
      if (!isEditing) setIsEditing(true);

    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-lg border bg-card p-6 shadow-sm">
          {/* Image Upload */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-xs">Upload Photo</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-sm text-muted-foreground">Click to upload profile picture</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (Optional)</Label>
                <Input
                  id="whatsapp"
                  placeholder="+1234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram (Optional)</Label>
                <Input
                  id="telegram"
                  placeholder="@username"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g. Graphic Design)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addSkill} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="gap-1 pl-3">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
