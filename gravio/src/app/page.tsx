import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryDashboard from "@/components/DeliveryDashboard";
import EditRoleMobile from "@/components/EditRoleMobile";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { redirect } from "next/navigation";

async function Home() {
  await connectDb();

  const session = await auth();

  const user = await User.findById(session?.user?.id).lean();

  if (!user) {
    redirect("/login");
  }

  const cleanUser = {
    ...user,
    _id: user._id.toString(),
  };

  const inCompelete =
    !cleanUser.mobile ||
    !cleanUser.role ||
    (!cleanUser.mobile && cleanUser.role == "user");

  if (inCompelete) {
    return <EditRoleMobile />;
  }

  return (
    <>
      <Nav user={cleanUser} />
      <GeoUpdater userId={cleanUser._id} />
      {user.role == "user" ? (
        <UserDashboard />
      ) : user.role == "admin" ? (
        <AdminDashboard />
      ) : (
        <DeliveryDashboard />
      )}
    </>
  );
}

export default Home;
