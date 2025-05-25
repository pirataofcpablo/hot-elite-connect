
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../hooks/useContent';
import { usePurchases } from '../hooks/usePurchases';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Heart, CreditCard, Clock, CheckCircle, Upload, Eye, User, Image, Video, Play } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { models, getContentsByModel } = useContent();
  const { createPurchase, getUserPurchases, hasAccess, updatePurchase } = usePurchases();
  
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [viewingContent, setViewingContent] = useState<any>(null);

  const userPurchases = getUserPurchases(user?.id || '');
  const approvedPurchases = userPurchases.filter(p => p.status === 'approved');

  // Mostrar todas as modelos no marketplace
  const availableModels = models;

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
    const fakeProofUrl = 'https://via.placeholder.com/300x400/000000/e10600?text=Comprovante';
    
    updatePurchase(purchaseId, {
      paymentProof: fakeProofUrl
    });

    toast({
      title: "Comprovante Enviado!",
      description: "Aguarde a aprovação da modelo",
    });
  };

  const handleViewContent = (model: any) => {
    const modelContents = getContentsByModel(model.id);
    setViewingContent({ model, contents: modelContents });
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
            <p className="text-gray-300 text-sm">Acesso por 30 dias a TODO o conteúdo</p>
          </div>
        </div>
      </div>
    );
  };

  const renderContentViewer = () => {
    if (!viewingContent) return null;

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-hotelite-dark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Portfolio de {viewingContent.model.name}
              </h2>
              <Button 
                variant="outline" 
                onClick={() => setViewingContent(null)}
              >
                Fechar
              </Button>
            </div>

            {viewingContent.contents.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Nenhum conteúdo disponível</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {viewingContent.contents.map((content: any) => (
                  <div key={content.id} className="glass-effect rounded-lg overflow-hidden">
                    <div className="aspect-video bg-hotelite-gray relative">
                      {content.thumbnail ? (
                        <img 
                          src={content.thumbnail} 
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {content.mediaType === 'video' ? (
                            <Video className="h-8 w-8 text-gray-400" />
                          ) : (
                            <Image className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                      )}
                      {content.mediaType === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-12 w-12 text-white/80" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2">{content.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {content.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="bg-hotelite-red text-white">
                          {content.mediaType === 'video' ? 'Vídeo' : content.mediaType === 'both' ? 'Misto' : 'Foto'}
                        </Badge>
                        <p className="text-gray-400 text-sm">
                          {content.mediaFiles.length} arquivo{content.mediaFiles.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              {availableModels.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Nenhuma modelo disponível no momento</p>
                  <p className="text-gray-500 text-sm">Aguarde novas modelos se cadastrarem</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableModels.map((model) => (
                    <div key={model.id} className="glass-effect p-4 rounded-lg border border-gray-700 card-hover">
                      <div className="flex flex-col items-center mb-4">
                        <Avatar className="h-24 w-24 mb-3">
                          <AvatarImage src={model.profileImage} alt={model.name} />
                          <AvatarFallback className="bg-hotelite-gray text-white text-xl">
                            <User className="h-12 w-12" />
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-white font-semibold text-lg text-center">{model.name}</h3>
                      </div>
                      
                      {model.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2 text-center">
                          {model.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="bg-hotelite-red text-white">
                          {model.totalContent} conteúdo{model.totalContent !== 1 ? 's' : ''}
                        </Badge>
                        <p className="text-hotelite-red font-bold text-lg">
                          R$ {model.monthlyPrice || 30}/mês
                        </p>
                      </div>

                      {hasAccess(user?.id || '', model.id) ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleViewContent(model)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Portfolio Completo
                        </Button>
                      ) : (
                        <Button 
                          className="w-full btn-primary"
                          onClick={() => handlePurchase(model)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Comprar Acesso Total
                        </Button>
                      )}

                      {selectedModel?.id === model.id && !hasAccess(user?.id || '', model.id) && (
                        renderPaymentInfo(model)
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                    const model = availableModels.find(m => m.id === purchase.modelId);
                    return (
                      <div key={purchase.id} className="glass-effect p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={model?.profileImage} alt={model?.name} />
                              <AvatarFallback className="bg-hotelite-gray text-white">
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
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
                                onClick={() => handleViewContent(model)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver Portfolio
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

      {renderContentViewer()}
    </div>
  );
};

export default UserDashboard;
