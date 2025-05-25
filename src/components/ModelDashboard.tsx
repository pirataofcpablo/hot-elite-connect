import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../hooks/useContent';
import { usePurchases } from '../hooks/usePurchases';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { DollarSign, Users, CheckCircle, XCircle, Edit, Trash2, Image, Video } from 'lucide-react';
import FileUpload from './FileUpload';

const ModelDashboard = () => {
  const { user, updateUser } = useAuth();
  const { contents, addContent, updateContent, deleteContent, getContentsByModel } = useContent();
  const { purchases, getModelPurchases, approvePurchase, rejectPurchase } = usePurchases();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail: '',
    mediaFiles: [] as string[],
    mediaType: 'image' as 'image' | 'video' | 'both'
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    description: user?.description || '',
    pixKey: user?.pixKey || '',
    mercadoPagoEmail: user?.mercadoPagoEmail || '',
    contactNumber: user?.contactNumber || '',
  });

  const myContents = getContentsByModel(user?.id || '');
  const myPurchases = getModelPurchases(user?.id || '');
  const pendingPurchases = myPurchases.filter(p => p.status === 'pending');
  const totalEarnings = myPurchases.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title || !newContent.description || newContent.price <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (!newContent.thumbnail) {
      toast({
        title: "Erro",
        description: "Adicione uma thumbnail para o conteúdo",
        variant: "destructive"
      });
      return;
    }

    if (newContent.mediaFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um arquivo de mídia",
        variant: "destructive"
      });
      return;
    }

    // Determinar tipo de mídia baseado nos arquivos enviados
    const hasImages = newContent.mediaFiles.some(file => file.startsWith('data:image/'));
    const hasVideos = newContent.mediaFiles.some(file => file.startsWith('data:video/'));
    
    let mediaType: 'image' | 'video' | 'both' = 'image';
    if (hasImages && hasVideos) {
      mediaType = 'both';
    } else if (hasVideos) {
      mediaType = 'video';
    }

    addContent({
      ...newContent,
      mediaType,
      modelId: user?.id || '',
      isActive: true,
    });

    setNewContent({
      title: '',
      description: '',
      price: 0,
      thumbnail: '',
      mediaFiles: [],
      mediaType: 'image'
    });

    toast({
      title: "Sucesso!",
      description: "Conteúdo adicionado com sucesso",
    });
  };

  const handleProfileUpdate = () => {
    updateUser(profileData);
    setEditingProfile(false);
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso",
    });
  };

  const handleThumbnailUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setNewContent({ ...newContent, thumbnail: urls[0] });
    }
  };

  const handleMediaUpload = (urls: string[]) => {
    setNewContent({ 
      ...newContent, 
      mediaFiles: [...newContent.mediaFiles, ...urls] 
    });
  };

  const removeThumbnail = () => {
    setNewContent({ ...newContent, thumbnail: '' });
  };

  const removeMediaFile = (index: number) => {
    const updatedFiles = newContent.mediaFiles.filter((_, i) => i !== index);
    setNewContent({ ...newContent, mediaFiles: updatedFiles });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard da Modelo</h1>
        <p className="text-gray-400">Gerencie seu conteúdo e aprove pagamentos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-hotelite-gray">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-hotelite-red">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-white data-[state=active]:bg-hotelite-red">
            Upload
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-white data-[state=active]:bg-hotelite-red">
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-white data-[state=active]:bg-hotelite-red">
            Perfil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-effect border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total de Conteúdos</CardTitle>
                <Image className="h-4 w-4 text-hotelite-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{myContents.length}</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Pagamentos Pendentes</CardTitle>
                <Users className="h-4 w-4 text-hotelite-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{pendingPurchases.length}</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Ganhos Totais</CardTitle>
                <DollarSign className="h-4 w-4 text-hotelite-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">R$ {totalEarnings.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Meus Conteúdos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myContents.map((content) => (
                  <div key={content.id} className="glass-effect p-4 rounded-lg border border-gray-700">
                    <div className="aspect-video bg-hotelite-gray rounded-lg mb-3 overflow-hidden">
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
                    </div>
                    <h3 className="text-white font-semibold mb-1">{content.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{content.description.slice(0, 100)}...</p>
                    <p className="text-hotelite-red font-bold mb-3">R$ {content.price.toFixed(2)}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteContent(content.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card className="glass-effect border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Adicionar Novo Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContentSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="content-title" className="text-white">Título do Conteúdo *</Label>
                  <Input
                    id="content-title"
                    placeholder="Ex: Ensaio Sensual #1"
                    className="input-field"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content-description" className="text-white">Descrição *</Label>
                  <Textarea
                    id="content-description"
                    placeholder="Descreva o conteúdo..."
                    className="input-field resize-none"
                    rows={3}
                    value={newContent.description}
                    onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content-price" className="text-white">Preço (R$) *</Label>
                  <Input
                    id="content-price"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="29.99"
                    className="input-field"
                    value={newContent.price || ''}
                    onChange={(e) => setNewContent({...newContent, price: Number(e.target.value)})}
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Thumbnail de Apresentação *</Label>
                  <FileUpload
                    type="thumbnail"
                    accept="image/*"
                    multiple={false}
                    onFilesUploaded={handleThumbnailUpload}
                    uploadedFiles={newContent.thumbnail ? [newContent.thumbnail] : []}
                    onRemoveFile={removeThumbnail}
                  />
                </div>

                <div>
                  <Label className="text-white">Arquivos de Mídia *</Label>
                  <FileUpload
                    type="media"
                    accept="image/*,video/*"
                    multiple={true}
                    maxFiles={10}
                    onFilesUploaded={handleMediaUpload}
                    uploadedFiles={newContent.mediaFiles}
                    onRemoveFile={removeMediaFile}
                  />
                </div>

                <Button type="submit" className="w-full btn-primary">
                  Publicar Conteúdo
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="glass-effect border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Aprovar Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPurchases.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum pagamento pendente</p>
              ) : (
                <div className="space-y-4">
                  {pendingPurchases.map((purchase) => (
                    <div key={purchase.id} className="glass-effect p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold">Compra de Acesso</p>
                          <p className="text-gray-400">Valor: R$ {purchase.amount.toFixed(2)}</p>
                          <p className="text-gray-400 text-sm">
                            Data: {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                          {purchase.paymentProof && (
                            <div className="mt-2">
                              <p className="text-gray-400 text-sm">Comprovante:</p>
                              <img 
                                src={purchase.paymentProof} 
                                alt="Comprovante" 
                                className="w-32 h-24 object-cover rounded mt-1 border border-gray-700"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              approvePurchase(purchase.id);
                              toast({
                                title: "Pagamento aprovado!",
                                description: "O usuário agora tem acesso ao seu conteúdo",
                              });
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              rejectPurchase(purchase.id);
                              toast({
                                title: "Pagamento rejeitado",
                                description: "O usuário foi notificado",
                              });
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-effect border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Configurações do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <>
                  <div>
                    <Label htmlFor="profile-name" className="text-white">Nome</Label>
                    <Input
                      id="profile-name"
                      className="input-field"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-description" className="text-white">Descrição</Label>
                    <Textarea
                      id="profile-description"
                      className="input-field resize-none"
                      value={profileData.description}
                      onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-pix" className="text-white">Chave PIX</Label>
                    <Input
                      id="profile-pix"
                      className="input-field"
                      value={profileData.pixKey}
                      onChange={(e) => setProfileData({...profileData, pixKey: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-mercadopago" className="text-white">Email Mercado Pago</Label>
                    <Input
                      id="profile-mercadopago"
                      type="email"
                      className="input-field"
                      value={profileData.mercadoPagoEmail}
                      onChange={(e) => setProfileData({...profileData, mercadoPagoEmail: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleProfileUpdate} className="btn-primary">
                      Salvar Alterações
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingProfile(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-400">Nome</Label>
                      <p className="text-white">{user?.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Email</Label>
                      <p className="text-white">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Descrição</Label>
                      <p className="text-white">{user?.description || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Chave PIX</Label>
                      <p className="text-white">{user?.pixKey || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Email Mercado Pago</Label>
                      <p className="text-white">{user?.mercadoPagoEmail || 'Não informado'}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingProfile(true);
                      setProfileData({
                        name: user?.name || '',
                        description: user?.description || '',
                        pixKey: user?.pixKey || '',
                        mercadoPagoEmail: user?.mercadoPagoEmail || '',
                        contactNumber: user?.contactNumber || '',
                      });
                    }}
                    className="btn-primary"
                  >
                    Editar Perfil
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelDashboard;
