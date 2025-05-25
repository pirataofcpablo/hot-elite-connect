
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Heart, Lock, Star, Users, Shield, Smartphone } from 'lucide-react';
import Dashboard from './Dashboard';
import FileUpload from '../components/FileUpload';

const Index = () => {
  const { isAuthenticated, login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'user' as 'model' | 'user',
    description: '',
    pixKey: '',
    mercadoPagoEmail: '',
    contactNumber: '',
    monthlyPrice: 30,
    profileImage: ''
  });
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hotelite-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hotelite-red"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(loginData.email, loginData.password);
      
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Login realizado com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: "Email ou senha incorretos",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    // Verificar se é modelo e se tem foto de perfil
    if (registerData.userType === 'model' && !registerData.profileImage) {
      toast({
        title: "Erro",
        description: "Modelos devem adicionar uma foto de perfil",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await register(registerData);
      
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Conta criada com sucesso! Verifique seu email para confirmar a conta.",
        });
        setActiveTab('login');
        setRegisterData({
          name: '',
          email: '',
          password: '',
          phone: '',
          userType: 'user',
          description: '',
          pixKey: '',
          mercadoPagoEmail: '',
          contactNumber: '',
          monthlyPrice: 30,
          profileImage: ''
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar a conta. Verifique se o email já não está em uso.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setRegisterData({...registerData, profileImage: urls[0]});
    }
  };

  const removeProfileImage = () => {
    setRegisterData({...registerData, profileImage: ''});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hotelite-black via-hotelite-dark to-hotelite-black">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-hotelite-red to-red-400 p-4 rounded-xl">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold font-montserrat mb-4">
            <span className="text-white">HOT</span>{' '}
            <span className="gradient-text">ELITE</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A plataforma premium onde modelos vendem conteúdo adulto exclusivo com total segurança e privacidade
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="glass-effect p-6 rounded-xl text-center card-hover">
            <Shield className="h-12 w-12 text-hotelite-red mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">100% Seguro</h3>
            <p className="text-gray-400">Pagamentos protegidos e conteúdo com acesso controlado</p>
          </div>
          <div className="glass-effect p-6 rounded-xl text-center card-hover">
            <Users className="h-12 w-12 text-hotelite-red mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Comunidade Exclusiva</h3>
            <p className="text-gray-400">Conecte-se com modelos premium e conteúdo de alta qualidade</p>
          </div>
          <div className="glass-effect p-6 rounded-xl text-center card-hover">
            <Smartphone className="h-12 w-12 text-hotelite-red mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">App Mobile</h3>
            <p className="text-gray-400">Instale em seu celular e tenha acesso onde estiver</p>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="max-w-md mx-auto">
          <Card className="glass-effect border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Entrar na Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-hotelite-gray">
                  <TabsTrigger value="login" className="text-white data-[state=active]:bg-hotelite-red">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-white data-[state=active]:bg-hotelite-red">
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="input-field"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-white">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="input-field"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="reg-name" className="text-white">Nome Completo *</Label>
                      <Input
                        id="reg-name"
                        placeholder="Seu nome completo"
                        className="input-field"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email" className="text-white">Email *</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="input-field"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password" className="text-white">Senha * (mínimo 6 caracteres)</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        className="input-field"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        minLength={6}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">WhatsApp (opcional)</Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        className="input-field"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="userType" className="text-white">Tipo de Conta *</Label>
                      <Select
                        value={registerData.userType}
                        onValueChange={(value: 'model' | 'user') => 
                          setRegisterData({...registerData, userType: value})
                        }
                      >
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Selecione o tipo de conta" />
                        </SelectTrigger>
                        <SelectContent className="bg-hotelite-gray border-gray-600">
                          <SelectItem value="user" className="text-white hover:bg-hotelite-red">
                            Usuário (Cliente)
                          </SelectItem>
                          <SelectItem value="model" className="text-white hover:bg-hotelite-red">
                            Modelo (Criador de Conteúdo)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {registerData.userType === 'model' && (
                      <>
                        <div>
                          <Label className="text-white">Foto de Perfil *</Label>
                          <FileUpload
                            onFilesUploaded={handleProfileImageUpload}
                            accept="image/*"
                            multiple={false}
                            uploadedFiles={registerData.profileImage ? [registerData.profileImage] : []}
                            onRemoveFile={removeProfileImage}
                            type="thumbnail"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-white">Descrição do Perfil</Label>
                          <Textarea
                            id="description"
                            placeholder="Descreva seu perfil e tipo de conteúdo..."
                            className="input-field resize-none"
                            value={registerData.description}
                            onChange={(e) => setRegisterData({...registerData, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="monthly-price" className="text-white">Preço Mensal (R$)</Label>
                          <Input
                            id="monthly-price"
                            type="number"
                            min="1"
                            placeholder="30"
                            className="input-field"
                            value={registerData.monthlyPrice}
                            onChange={(e) => setRegisterData({...registerData, monthlyPrice: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pix" className="text-white">Chave PIX (opcional)</Label>
                          <Input
                            id="pix"
                            placeholder="Sua chave PIX"
                            className="input-field"
                            value={registerData.pixKey}
                            onChange={(e) => setRegisterData({...registerData, pixKey: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="mercadopago" className="text-white">Email Mercado Pago (opcional)</Label>
                          <Input
                            id="mercadopago"
                            type="email"
                            placeholder="mercadopago@email.com"
                            className="input-field"
                            value={registerData.mercadoPagoEmail}
                            onChange={(e) => setRegisterData({...registerData, mercadoPagoEmail: e.target.value})}
                          />
                        </div>
                      </>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Criando Conta...' : 'Criar Conta'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Install PWA Button */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
              toast({
                title: "App Instalável",
                description: "Para instalar, use o menu do navegador e selecione 'Instalar App'",
              });
            }}
            className="btn-secondary"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Instalar App no Celular
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
