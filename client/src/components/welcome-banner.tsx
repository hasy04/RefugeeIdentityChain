import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export function WelcomeBanner() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      className="bg-gradient-to-r from-primary via-accent to-secondary text-white p-8 rounded-lg shadow-xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-3xl font-bold mb-4"
        variants={itemVariants}
      >
        Welcome back, {user?.fullName}!
      </motion.h1>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        <div className="bg-white/10 p-4 rounded">
          <h3 className="font-semibold">Documents</h3>
          <p className="text-sm opacity-80">Manage your identity documents</p>
        </div>
        <div className="bg-white/10 p-4 rounded">
          <h3 className="font-semibold">Verification</h3>
          <p className="text-sm opacity-80">Check document verification status</p>
        </div>
        <div className="bg-white/10 p-4 rounded">
          <h3 className="font-semibold">Security</h3>
          <p className="text-sm opacity-80">Update your security settings</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
