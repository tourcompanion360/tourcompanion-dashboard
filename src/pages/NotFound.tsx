import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
          <CardTitle className="text-2xl">Pagina non trovata</CardTitle>
          <CardDescription>
            La pagina che stai cercando non esiste o è stata spostata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Torna alla Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna Indietro
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;