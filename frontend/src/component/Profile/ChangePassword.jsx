import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function ChangePassword() {
 const {userId} = useParams()
//  console.log(userId);
 

  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ msg , setMsg ]= useState("")
  const navigate = useNavigate()
  const [ form , setForm ]= useState({
   oldPassword :"",
   newPassword:"",
   confirmPassword:""
  })
  const handleChange =(e)=>{
      setForm({
      ...form,
      [e.target.name]: e.target.value,})
  }

const handleSubmit = async (e) => {
  e.preventDefault();
  setMsg("");

  if (form.newPassword !== form.confirmPassword) {
    setMsg("New password and confirm password do not match");
    return;
  }

  try {
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login again");
      return;
    }

    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/change-password`,
      
       form // backend ready ✔
      ,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Password changed successfully");
    navigate(`/c/${userId}`);
  } catch (error) {
    console.log("error:", error.response?.data || error);
    alert(error.response?.data?.message || "Failed to change password");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>
            Keep your account secure by updating your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                name="oldPassword"
                type="password"
                placeholder="Enter current password"
                value={form.oldPassword}
                onChange ={handleChange}
               
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={handleChange}
                required
               
              />
               <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Enter new password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              
              />
               {msg && (
  <p className="text-sm text-red-500 mt-1">{msg}</p>
)}
            </div>

            <div className="space-y-2">
             
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
