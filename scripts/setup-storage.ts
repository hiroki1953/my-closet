#!/usr/bin/env tsx

import 'dotenv/config';
import { supabaseAdmin } from '../src/lib/supabase';

async function setupStorage() {
  console.log('🚀 Supabase Storage セットアップを開始します...');

  try {
    // 既存のバケット一覧を確認
    console.log('📋 既存のバケット一覧を確認中...');
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ バケット一覧の取得に失敗:', listError);
      return;
    }

    console.log('📦 既存のバケット:', buckets?.map(b => b.name) || []);

    // profile-images バケットが存在するかチェック
    const profileImagesBucketExists = buckets?.some(bucket => bucket.name === 'profile-images');

    if (!profileImagesBucketExists) {
      console.log('📁 profile-images バケットを作成中...');
      
      const { data: createData, error: createError } = await supabaseAdmin.storage.createBucket('profile-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
        fileSizeLimit: 10485760, // 10MB
      });

      if (createError) {
        console.error('❌ profile-images バケットの作成に失敗:', createError);
        return;
      }

      console.log('✅ profile-images バケットを作成しました:', createData);
    } else {
      console.log('✅ profile-images バケットは既に存在します');
    }

    // clothing-items バケットも作成（将来の服の画像用）
    const clothingItemsBucketExists = buckets?.some(bucket => bucket.name === 'clothing-items');

    if (!clothingItemsBucketExists) {
      console.log('👕 clothing-items バケットを作成中...');
      
      const { data: createData, error: createError } = await supabaseAdmin.storage.createBucket('clothing-items', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
        fileSizeLimit: 10485760, // 10MB
      });

      if (createError) {
        console.error('❌ clothing-items バケットの作成に失敗:', createError);
        return;
      }

      console.log('✅ clothing-items バケットを作成しました:', createData);
    } else {
      console.log('✅ clothing-items バケットは既に存在します');
    }

    // 最終確認
    console.log('🔍 最終確認: バケット一覧を再取得...');
    const { data: finalBuckets, error: finalError } = await supabaseAdmin.storage.listBuckets();
    
    if (finalError) {
      console.error('❌ 最終確認でエラー:', finalError);
      return;
    }

    console.log('🎉 セットアップ完了! 利用可能なバケット:');
    finalBuckets?.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`);
    });

  } catch (error) {
    console.error('💥 セットアップ中にエラーが発生:', error);
  }
}

// メイン実行
setupStorage();
