
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../hooks/useContent';
import { usePurchases } from '../hooks/usePurchases';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Heart, CreditCard, Clock, CheckCircle, Upload, Eye } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { models, getContentsByModel } = useContent();
  const { createPurchase, getUserPurchases, hasAccess, updatePurchase } = usePurchases();
  
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const userPurchases = getUserPurchases(user?.id || '');
  const approvedPurchases = userPurchases.filter(p => p.status === 'approved');

  const handlePurchase = (model: any) => {
    const existingPurchase = userPurchases.find(
      p => p.modelId === model.id && p.status === 'pending'
    );

    if (existingPurchase) {
      toast({
        title: "Compra Pendente",
        description: "Você já tem uma compra pendente para esta modelo",
        variant: "destructive"
      });
      return;
    }

    if (hasAccess(user?.id || '', model.id)) {
      toast({
        title: "Acesso Ativo",
        description: "Você já tem acesso ao conteúdo desta modelo",
        variant: "destructive"
      });
      return;
    }

    const purchase = createPurchase({
      userId: user?.id || '',
      modelId: model.id,
      amount: model.monthlyPrice || 30,
      status: 'pending',
    });

    setSelectedModel(model);
    setActiveTab('purchases');
    
    toast({
      title: "Compra Iniciada!",
      description: "Agora envie o comprovante de pagamento",
    });
  };

  const handleUploadProof = (purchaseId: string) => {
    // Simular upload de comprovante
    const fakeProofUrl = 'https://via.placeholder.com/300x400/000000/e10600?text=Comprovante';
    
    updatePurchase(purchaseId, {
      paymentProof: fakeProofUrl
    });

    toast({
      title: "Comprovante Enviado!",
      description: "Aguarde a aprovação da modelo",
    });
  };

  const renderPaymentInfo = (model: any) => {
    return (
      <div className="glass-effect p-4 rounded-lg border border-gray-700 mt-4">
        <h4 className="text-white font-semibold mb-3">Dados para Pagamento</h4>
        <div className="space-y-2">
          {model.pixKey && (
            <div>
              <p className="text-gray-400 text-sm">Chave PIX:</p>
              <p className="text-white font-mono">{model.pixKey}</p>
            </div>
          )}
          {model.mercadoPagoEmail && (
            <div>
              <p className="text-gray-400 text-sm">Email Mercado Pago:</p>
              <p className="text-white">{model.mercadoPagoEmail}</p>
            </div>
          )}
          {model.contactNumber && (
            <div>
              <p className="text-gray-400 text-sm">Contato:</p>
              <p className="text-white">{model.contactNumber}</p>
            </div>
          )}
          <div className="mt-3 p-3 bg-hotelite-red/20 rounded border border-hotelite-red">
            <p className="text-white font-semibold">Valor: R$ {model.monthlyPrice || 30}.00</p>
            <p className="text-gray-300 text-sm">Acesso por 30 dias</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard do Usuário</h1>
        <p className="text-gray-400">Explore conteúdo exclusivo de modelos premium</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-hotelite-gray">
          <TabsTrigger value="marketplace" className="text-white data-[state=active]:bg-hotelite-red">
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="purchases" className="text-white data-[state=active]:bg-hotelite-red">
            Minhas Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          <Card className="glass-effect border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Modelos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div key={model.id} className="glass-effect p-4 rounded-lg border border-gray-700 card-hover">
                    <div className="aspect-square bg-hotelite-gray rounded-lg mb-4 flex items-center justify-center">
                      <Heart className="h-12 w-12 text-gray-400" />
                    </div>
                    
                    <h3 className="text-white font-semibold text-lg mb-2">{model.name}</h3>
                    
                    {model.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {model.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="bg-hotelite-red text-white">
                        {model.totalContent} conteúdos
                      </Badge>
                      <p className="text-hotelite-red font-bold text-lg">
                        R$ {model.monthlyPrice || 30}/mês
                      </p>
                    </div>

                    {hasAccess(user?.id || '', model.id) ? (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedModel(model);
                          // Navegar para visualizar conteúdo
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Conteúdo
                      </Button>
                    ) : (
                      <Button 
                        className="w-full btn-primary"
                        onClick={() => handlePurchase(model)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Comprar Acesso (30 dias)
                      </Button>
                    )}

                    {/* Mostrar dados de pagamento se foi selecionado para compra */}
                    {selectedModel?.id === model.id && !hasAccess(user?.id || '', model.id) && (
                      renderPaymentInfo(model)
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="glass-effect border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total de Compras</CardTitle>
                <CreditCard className="h-4 w-4 text-hotelite-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{userPurchases.length}</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Acessos Ativos</CardTitle>
                <CheckCircle className="h-4 w-4 text-hotelite-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{approvedPurchases.length}</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Aguardando Aprovação</CardTitle>
                <Clock className="h-4 w-4 text-hotelite-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {userPurchases.filter(p => p.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Histórico de Compras</CardTitle>
            </CardHeader>
            <CardContent>
              {userPurchases.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma compra realizada ainda</p>
              ) : (
                <div className="space-y-4">
                  {userPurchases.map((purchase) => {
                    const model = models.find(m => m.id === purchase.modelId);
                    return (
                      <div key={purchase.id} className="glass-effect p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{model?.name}</h4>
                            <p className="text-gray-400">R$ {purchase.amount.toFixed(2)}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                            
                            <div className="mt-2">
                              {purchase.status === 'pending' && (
                                <Badge variant="secondary" className="bg-yellow-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Aguardando Aprovação
                                </Badge>
                              )}
                              {purchase.status === 'approved' && (
                                <Badge variant="secondary" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Aprovado
                                </Badge>
                              )}
                              {purchase.status === 'rejected' && (
                                <Badge variant="destructive">
                                  Rejeitado
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            {purchase.status === 'pending' && !purchase.paymentProof && (
                              <Button 
                                size="sm" 
                                className="btn-primary"
                                onClick={() => handleUploadProof(purchase.id)}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Enviar Comprovante
                              </Button>
                            )}
                            
                            {purchase.status === 'approved' && hasAccess(user?.id || '', purchase.modelId) && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  // Navegar para o conteúdo da modelo
                                  toast({
                                    title: "Acessando conteúdo",
                                    description: `Visualizando conteúdo de ${model?.name}`,
                                  });
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver Conteúdo
                              </Button>
                            )}
                          </div>
                        </div>

                        {purchase.paymentProof && (
                          <div className="mt-3">
                            <p className="text-gray-400 text-sm mb-2">Comprovante enviado:</p>
                            <img 
                              src={purchase.paymentProof} 
                              alt="Comprovante" 
                              className="w-32 h-24 object-cover rounded"
                            />
                          </div>
                        )}

                        {purchase.status === 'approved' && purchase.expiresAt && (
                          <div className="mt-3 p-2 bg-green-600/20 rounded border border-green-600">
                            <p className="text-green-400 text-sm">
                              Acesso válido até: {new Date(purchase.expiresAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
