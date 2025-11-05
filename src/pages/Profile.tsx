import Navbar from "@/components/Navbar";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
      </main>
    </div>
  );
};

export default Profile;
