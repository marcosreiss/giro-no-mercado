// src/lib/storage.ts
import { supabase } from "./supabase";

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload de imagem para o Supabase Storage
 * @param file - Arquivo a ser enviado
 * @param bucket - Nome do bucket ('produtos' ou 'perfis')
 * @param folder - Pasta dentro do bucket (opcional)
 */
export async function uploadImage(
  file: File,
  bucket: "produtos" | "perfis",
  folder?: string,
): Promise<UploadResult> {
  try {
    // Validar tipo de arquivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Formato inválido. Use JPEG, PNG ou WebP");
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Imagem muito grande. Máximo 5MB");
    }

    // Gerar nome único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split(".").pop();
    const fileName = `${timestamp}_${randomStr}.${extension}`;

    // Definir caminho
    const path = folder ? `${folder}/${fileName}` : fileName;

    // Converter para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    // Obter URL pública
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw error;
  }
}

/**
 * Deletar imagem do Supabase Storage
 * @param bucket - Nome do bucket
 * @param path - Caminho do arquivo
 */
export async function deleteImage(
  bucket: "produtos" | "perfis",
  path: string,
): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    throw error;
  }
}

/**
 * Atualizar imagem (deleta a antiga e faz upload da nova)
 */
export async function updateImage(
  file: File,
  bucket: "produtos" | "perfis",
  oldPath: string | null,
  folder?: string,
): Promise<UploadResult> {
  try {
    // Deletar imagem antiga se existir
    if (oldPath) {
      await deleteImage(bucket, oldPath);
    }

    // Upload da nova imagem
    return await uploadImage(file, bucket, folder);
  } catch (error) {
    console.error("Erro ao atualizar imagem:", error);
    throw error;
  }
}
