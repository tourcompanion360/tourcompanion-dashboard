import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2, Mail, Lock, User, Phone, Globe } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    contactEmail: '',
    phone: '',
    website: '',
  });

  // Dark input styles for better contrast on dark card
  const inputClass = "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(signInData.email, signInData.password);

      if (error) {
        toast({
          title: 'Authentication Error',
          description: error.message || 'Failed to sign in. Please check your credentials.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.user) {
        // Check if creator profile exists
        const { data: creatorData, error: creatorError } = await supabase
          .from('creators')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (creatorError || !creatorData) {
          toast({
            title: 'Profile Not Found',
            description: 'No creator profile found. Please sign up first.',
            variant: 'destructive',
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: 'Welcome Back!',
          description: `Signed in successfully as ${creatorData.agency_name}`,
        });

        navigate('/');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (!signUpData.agencyName || !signUpData.contactEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await signUp(
        signUpData.email,
        signUpData.password,
        {
          agency_name: signUpData.agencyName,
        }
      );

      if (authError) {
        toast({
          title: 'Sign Up Error',
          description: authError.message || 'Failed to create account.',
          variant: 'destructive',
        });
        return;
      }

      if (authData?.user) {
        // Create creator profile in database
        const { error: creatorError } = await supabase
          .from('creators')
          .insert({
            user_id: authData.user.id,
            agency_name: signUpData.agencyName,
            contact_email: signUpData.contactEmail,
            phone: signUpData.phone || null,
            website: signUpData.website || null,
            subscription_plan: 'basic',
            subscription_status: 'active',
          });

        if (creatorError) {
          console.error('Creator profile creation error:', creatorError);
          toast({
            title: 'Profile Creation Error',
            description: 'Account created but profile setup failed. Please contact support.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Account Created!',
          description: 'Your creator account has been set up successfully. You can now sign in.',
        });

        // Switch to sign in tab
        setActiveTab('signin');
        setSignInData({
          email: signUpData.email,
          password: signUpData.password,
        });

        // Reset sign up form
        setSignUpData({
          email: '',
          password: '',
          confirmPassword: '',
          agencyName: '',
          contactEmail: '',
          phone: '',
          website: '',
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TourCompanion SaaS</h1>
          <p className="text-slate-300">Manage your virtual tours and clients</p>
        </div>

        <Card className="shadow-2xl border-slate-700 bg-slate-800/90 text-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-100">Tour Creator Portal</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        className={`pl-9 ${inputClass}`}
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-9 ${inputClass}`}
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-agency">Agency Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-agency"
                        type="text"
                        placeholder="Your Agency Name"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.agencyName}
                        onChange={(e) => setSignUpData({ ...signUpData, agencyName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-contact-email">Contact Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-contact-email"
                        type="email"
                        placeholder="contact@agency.com"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.contactEmail}
                        onChange={(e) => setSignUpData({ ...signUpData, contactEmail: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.website}
                        onChange={(e) => setSignUpData({ ...signUpData, website: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-400 mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
