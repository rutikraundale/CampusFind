import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Emailstep from "../components/postitempages/Emailstep";
import Otpstep from "../components/postitempages/Otpstep";
import Postform from "../components/postitempages/Postform";

const PostItem = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  // email → otp → form → success

  const [authData, setAuthData] = useState(null);

  return (
    <div className="flex justify-center w-full px-4 py-10">
      <div className="w-full max-w-md">
        {step === "email" && (
          <Emailstep
            onOtpSent={(data) => {
              setAuthData(data);
              setStep("otp");
            }}
          />
        )}

        {step === "otp" && (
          <Otpstep
            email={authData.email}
            userId={authData.userId}
            onVerified={() => setStep("form")}
            onBack={() => setStep("email")}
          />
        )}

        {step === "form" && (
          <Postform
            email={authData.email}
            onSuccess={() => {
              setStep("success");
              setTimeout(() => navigate("/"), 2000);
            }}
          />
        )}

        {step === "success" && (
          <div className="bg-green-600 text-white p-6 rounded-lg text-center">
            Item posted successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default PostItem;
