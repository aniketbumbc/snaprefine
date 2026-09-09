"use client";
import React from 'react';  // must be imported

import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { LeftSidebar } from "@/components/left-sidebar";
import ImageGenerationLoading from "@/components/image-generation";
import { AIPromptInput } from "@/components/prompt-input";
import { RightSidebar } from "@/components/right-sidebar";
import { useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorState';
import ImageEditor from '@/components/image-editor';
import { Toaster } from '@/components/ui/toaster';
import { ALLOWED_UPLOAD_IMAGE_TYPES, MAX_UPLOAD_IMAGE_BYTES } from '@/lib/constants';

export default function Home() {

  const fileInputRef = useRef<HTMLInputElement>(null);
 const { imageUrl, setImageUrl, isHistoryOpen, isLoading, showToast } = useEditorStore();
  const handleSelectImage = () => {
    fileInputRef.current?.click();
  }

  const handlImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    if (!ALLOWED_UPLOAD_IMAGE_TYPES.includes(file.type)) {
      showToast('Unsupported file type. Please upload a PNG, JPEG, WEBP, or GIF image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
      showToast(
        `Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is ${MAX_UPLOAD_IMAGE_BYTES / (1024 * 1024)}MB.`,
      );
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = reader.result as string;
      setImageUrl(image);
    };
    reader.readAsDataURL(file);
  };


  return (
    <>
      <Toaster />
      <div className="w-full h-dvh flex flex-col overflow-hidden">

        <input type="file" className='hidden' accept='image/*' ref={fileInputRef} onChange={handlImageUpload}/>

        <Navbar />
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* LEFT COLUMN */}
          <LeftSidebar />

          {/* MIDDLE COLUMN */}
          <main className="flex-1 flex flex-col min-w-0 bg-muted/50 relative">
            {/* CANVAS AREA */}
            <div className="flex-1 relative overflow-hidden w-full h-full">
              {/* BACKGROUND PATTERN */}
              <div
                className="absolute inset-0 opacity-[0.05] text-foreground"
                style={{
                  backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>

              {/* MAIN EDITOR SCREEN */}
              <div className="w-full h-full flex items-center justify-center p-6 md:p-10">
                {!imageUrl ? (
                  <div className="text-center space-y-6 max-w-sm z-10 ">
                    <div className="w-24 h-24 bg-muted/50 rounded-3xl border border-border flex items-center justify-center mx-auto shadow-2xl shadow-yellow-900/10">
                      <Image
                        src={"/logo.png"}
                        width={500}
                        height={500}
                        alt="logo"
                        className=""
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        Start Creating
                      </h3>
                      <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                        Upload an image to unlock the full potential of{" "}
                        <span className="text-yellow-500 font-medium">
                          Coder&apos;s Banana
                        </span>{" "}
                        AI tools.
                      </p>
                    </div>
                    <Button
                      onClick={handleSelectImage}
                      className="w-full h-11 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      Select Image
                    </Button>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                  {/* <Image src={imageUrl} alt="uploaded image" width={500} height={500} className="object-contain" /> */}
                  <ImageEditor />
                  </div>
                )}
              </div>

              {/* render when image in generating */}
              {isLoading && <ImageGenerationLoading />}
            </div>

            {/* PROMPT INPUT AREA */}
            <div className="shrink-0 bg-background border-t border-border p-4 lg:p-6 z-40">
              <AIPromptInput />
            </div>
          </main>


          {/* RIGHT COLUMNS EDIT HISTORY */}
          {isHistoryOpen && <RightSidebar />}
        </div>
      </div>
    </>
  );
}
