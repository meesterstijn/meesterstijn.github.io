import { useNavigate } from "react-router-dom";
import EnergizersView from "@/components/Energizers";

const Energizers = () => {
  const navigate = useNavigate();
  return <EnergizersView onClose={() => navigate("/")} />;
};

export default Energizers;
