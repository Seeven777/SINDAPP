import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useAuth } from '../AuthProvider';
import { Heart, MessageSquare, Share2, Image as ImageIcon, Send, MoreVertical, Trash2, Loader2, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for the Feed
interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  imageUrl?: string;
  likes: string[]; // array of user UIDs
  comments: Comment[];
  createdAt: string;
}

const Community: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Comments UI state map: { postId: 'comment text' }
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  // Expand comments section state: { postId: boolean }
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    });
    return () => unsubscribe();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB.");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if ((!newPostText.trim() && !selectedImage) || !profile) return;
    
    setIsPosting(true);
    let imageUrl = '';

    try {
      if (selectedImage) {
        const storageRef = ref(storage, `community/${Date.now()}_${selectedImage.name}`);
        const snapshot = await uploadBytes(storageRef, selectedImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'community_posts'), {
        userId: profile.uid,
        userName: profile.name,
        userPhoto: profile.photoUrl || '',
        text: newPostText,
        imageUrl,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      });

      setNewPostText('');
      clearImage();
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Falha ao publicar. Tente novamente.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string, hasLiked: boolean) => {
    if (!profile) return;
    const postRef = doc(db, 'community_posts', postId);
    try {
      if (hasLiked) {
        await updateDoc(postRef, { likes: arrayRemove(profile.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(profile.uid) });
      }
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !profile) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 9),
      userId: profile.uid,
      userName: profile.name,
      userPhoto: profile.photoUrl || '',
      text,
      createdAt: new Date().toISOString()
    };

    const postRef = doc(db, 'community_posts', postId);
    try {
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      // Clear input and auto expand
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setExpandedComments(prev => ({ ...prev, [postId]: true }));
    } catch (error) {
      console.error("Erro ao comentar:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Deseja realmente excluir esta publicação?")) {
      try {
        await deleteDoc(doc(db, 'community_posts', postId));
      } catch (error) {
        console.error("Erro ao excluir post:", error);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Comunidade</h1>
        <p className="text-[var(--text-main)] opacity-40 mt-1 font-medium">Troque ideias, tire dúvidas e conecte-se com colegas.</p>
      </header>

      {/* Create Post Form */}
      <div className="glass-card p-6 border-white/5 space-y-4 shadow-xl">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 shrink-0 border border-white/10 flex items-center justify-center">
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-[var(--text-main)] opacity-40" />
            )}
          </div>
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder={`No que você está pensando, ${profile?.name?.split(' ')[0] || 'colega'}?`}
            className="w-full bg-transparent border-none text-[var(--text-main)] resize-none outline-none font-medium placeholder:text-white/30 pt-3"
            rows={3}
          />
        </div>

        {imagePreview && (
          <div className="relative rounded-2xl overflow-hidden mt-4 border border-white/10">
            <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[400px] object-cover" />
            <button 
              onClick={clearImage}
              className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageSelect}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-all font-bold text-sm"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Foto/Vídeo</span>
            </button>
          </div>
          <button
            disabled={isPosting || (!newPostText.trim() && !selectedImage)}
            onClick={handlePost}
            className="premium-gradient text-[var(--text-main)] font-black py-2.5 px-6 rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-50 hover:scale-105 transition-all text-sm uppercase tracking-widest flex items-center gap-2"
          >
            {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publicar
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post) => {
            const hasLiked = profile?.uid ? post.likes.includes(profile.uid) : false;
            const isOwner = profile?.uid === post.userId;
            const isAdmin = profile?.role === 'admin' || profile?.role === 'gestao' || profile?.role === 'diretoria';
            
            return (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card overflow-hidden shadow-xl border-white/5"
              >
                {/* Post Header */}
                <div className="p-5 flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                      {post.userPhoto ? (
                        <img src={post.userPhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                       <User className="w-6 h-6 text-[var(--text-main)] opacity-40" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-main)] text-base leading-tight">
                        {post.userName}
                      </h4>
                      <p className="text-[10px] text-[var(--text-main)] opacity-40 font-black tracking-widest uppercase">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  {(isOwner || isAdmin) && (
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Body */}
                {post.text && (
                  <div className="px-5 pb-4">
                    <p className="text-[var(--text-main)] opacity-80 whitespace-pre-wrap font-medium">{post.text}</p>
                  </div>
                )}
                
                {post.imageUrl && (
                  <div className="w-full bg-black/40 max-h-[500px] flex items-center justify-center overflow-hidden border-y border-white/5">
                    <img src={post.imageUrl} alt="Post" className="w-full object-cover max-h-[500px]" loading="lazy" />
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-5 py-4 border-b border-white/5 flex gap-6">
                  <button 
                    onClick={() => handleLike(post.id, hasLiked)}
                    className={`flex items-center gap-2 font-bold transition-colors ${hasLiked ? 'text-red-500' : 'text-[var(--text-main)] opacity-40 hover:text-white'}`}
                  >
                    <motion.span
                      whileTap={{ scale: 1.4 }}
                      animate={hasLiked ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className={`w-6 h-6 ${hasLiked ? 'fill-current' : ''}`} />
                    </motion.span>
                    <span>{post.likes.length || ''}</span>
                  </button>
                  <button 
                    onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: true }))}
                    className="flex items-center gap-2 font-bold text-[var(--text-main)] opacity-40 hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span>{post.comments?.length || ''}</span>
                  </button>
                  <button className="flex items-center gap-2 font-bold text-[var(--text-main)] opacity-40 hover:text-white transition-colors ml-auto">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments[post.id] && (
                  <div className="bg-black/20 p-5 space-y-4">
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 shrink-0 flex items-center justify-center border border-white/10">
                          {comment.userPhoto ? (
                            <img src={comment.userPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-[var(--text-main)] opacity-40" />
                          )}
                        </div>
                        <div className="flex-1 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                          <p className="font-bold text-[var(--text-main)] opacity-90 text-[12px]">{comment.userName}</p>
                          <p className="text-[var(--text-main)] opacity-70 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Comment Input */}
                    <div className="flex gap-3 items-center mt-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 shrink-0 flex items-center justify-center border border-white/10">
                        {profile?.photoUrl ? (
                          <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-[var(--text-main)] opacity-40" />
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                          placeholder="Adicione um comentário..."
                          className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-[var(--text-main)] focus:border-primary outline-none transition-all placeholder:text-white/30"
                        />
                        <button 
                          onClick={() => handleComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/20 rounded-full transition-all disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Expand Comments Trigger (if unexpanded & has comments) */}
                {!expandedComments[post.id] && post.comments?.length > 0 && (
                  <div className="px-5 py-3 bg-black/10 hover:bg-black/20 transition-colors cursor-pointer" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: true }))}>
                    <p className="text-[var(--text-main)] opacity-40 font-bold text-sm">Ver todos os {post.comments.length} comentários</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {posts.length === 0 && (
          <div className="py-20 text-center glass-card border-dashed border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-[var(--text-main)] opacity-10" />
            </div>
            <p className="text-[var(--text-main)] opacity-30 font-black uppercase tracking-widest text-sm">Seja o primeiro a publicar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
