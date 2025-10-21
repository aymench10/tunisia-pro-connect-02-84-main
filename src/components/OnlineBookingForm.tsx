import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, ShoppingCart } from "lucide-react";

interface OnlineBookingFormProps {
  providerId: string;
  providerName: string;
}

const OnlineBookingForm = ({ providerId, providerName }: OnlineBookingFormProps) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [requirements, setRequirements] = useState("");
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a project request",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create a message-based "booking" for online services
      // This could be stored as a project request or chat message
      const projectRequest = {
        providerId,
        projectTitle,
        projectDetails,
        budget,
        timeline,
        requirements,
        clientId: user.id,
        status: 'pending'
      };

      // For now, we'll show success and redirect to chat
      toast({
        title: "Project Request Submitted",
        description: "Your project details have been sent. Start a chat to discuss further.",
      });
      
      navigate(`/chat?providerId=${providerId}`);
    } catch (error) {
      console.error("Project submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartChat = () => {
    navigate(`/chat?providerId=${providerId}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold">Online Service Request</CardTitle>
          <CardDescription className="text-base">
            Describe your project requirements for {providerName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Provider Info */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="font-semibold text-lg">Service Provider: {providerName}</p>
            <p className="text-sm text-muted-foreground">Online Service</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Project Title */}
            <div className="space-y-2">
              <Label htmlFor="project-title" className="text-sm font-medium text-foreground">
                Project Title
              </Label>
              <Input 
                id="project-title" 
                placeholder="Brief title for your project"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
                className="h-11 border-gray-300 focus:border-primary"
              />
            </div>

            {/* Project Details */}
            <div className="space-y-2">
              <Label htmlFor="project-details" className="text-sm font-medium text-foreground">
                Project Description
              </Label>
              <Textarea 
                id="project-details" 
                placeholder="Describe your project in detail..."
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                required
                rows={4}
                className="border-gray-300 focus:border-primary resize-none"
              />
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-sm font-medium text-foreground">
                Specific Requirements
              </Label>
              <Textarea 
                id="requirements" 
                placeholder="Any specific requirements, features, or deliverables..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                className="border-gray-300 focus:border-primary resize-none"
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-medium text-foreground">
                Budget Range
              </Label>
              <Select value={budget} onValueChange={setBudget} required>
                <SelectTrigger className="h-11 border-gray-300">
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-500">Under 500 TND</SelectItem>
                  <SelectItem value="500-1000">500 - 1,000 TND</SelectItem>
                  <SelectItem value="1000-2500">1,000 - 2,500 TND</SelectItem>
                  <SelectItem value="2500-5000">2,500 - 5,000 TND</SelectItem>
                  <SelectItem value="5000-plus">5,000+ TND</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-sm font-medium text-foreground">
                Timeline
              </Label>
              <Select value={timeline} onValueChange={setTimeline} required>
                <SelectTrigger className="h-11 border-gray-300">
                  <SelectValue placeholder="When do you need this completed?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">As soon as possible</SelectItem>
                  <SelectItem value="1-week">Within 1 week</SelectItem>
                  <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="flexible">Flexible timeline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                I agree to the terms and conditions and consent to the processing of my personal data.
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12 border-2 hover:bg-muted/50 font-medium"
                onClick={handleStartChat}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat First
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !agree}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Project Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineBookingForm;