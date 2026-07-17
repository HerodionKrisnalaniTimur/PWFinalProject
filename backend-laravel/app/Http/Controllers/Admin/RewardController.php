<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RewardController extends Controller
{
    private function uploadToImageKit($file): string
    {
        $response = Http::withBasicAuth(env('IMAGEKIT_PRIVATE_KEY'), '')
            ->attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName()
            )
            ->post('https://upload.imagekit.io/api/v1/files/upload', [
                'fileName' => $file->getClientOriginalName(),
                'useUniqueFileName' => 'true',
                'folder' => '/rewards',
            ]);

        if (!$response->successful()) {
            throw new \Exception('Upload ke ImageKit gagal: ' . $response->body());
        }

        return $response->json('url');
    }

    public function store(Request $request)
    {
        $request->validate([
            'studio' => 'required|string|max:255',
            'item_name' => 'required|string|max:255|unique:rewards,item_name',
            'price' => 'required|integer|min:0',
            'old_price' => 'nullable|integer|min:0',
            'img' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'tag' => 'nullable|string|max:50',
        ], [
            'item_name.unique' => 'Nama reward/produk ini sudah ada di Display, silakan gunakan nama lain.',
        ]);

        try {
            $imageUrl = null;
            if ($request->hasFile('img')) {
                $imageUrl = $this->uploadToImageKit($request->file('img'));
            }

            $reward = Reward::create([
                'studio' => $request->studio,
                'item_name' => $request->item_name,
                'price' => $request->price,
                'old_price' => $request->old_price,
                'img' => $imageUrl ?? '',
                'tag' => $request->tag,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reward created successfully',
                'data' => $reward
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $reward = Reward::find($id);

        if (!$reward) {
            return response()->json([
                'success' => false,
                'message' => 'Reward not found'
            ], 404);
        }

        $request->validate([
            'studio' => 'string|max:255',
            'item_name' => 'string|max:255',
            'price' => 'integer|min:0',
            'old_price' => 'nullable|integer|min:0',
            'img' => 'string',
            'tag' => 'nullable|string|max:50',
        ]);

        $reward->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Reward updated successfully',
            'data' => $reward
        ]);
    }

    private function deleteFromImageKit(?string $imageUrl): void
    {
        if (!$imageUrl) {
            return;
        }

        $urlEndpoint = env('IMAGEKIT_URL_ENDPOINT', 'https://ik.imagekit.io/zentrix');
        if (!str_contains($imageUrl, $urlEndpoint)) {
            return;
        }

        $path = str_replace($urlEndpoint, '', $imageUrl);

        try {
            $listResponse = Http::withBasicAuth(env('IMAGEKIT_PRIVATE_KEY'), '')
                ->get('https://api.imagekit.io/v1/files', [
                    'path' => $path
                ]);

            if ($listResponse->successful() && !empty($listResponse->json())) {
                $files = $listResponse->json();
                if (isset($files[0]['fileId'])) {
                    $fileId = $files[0]['fileId'];
                    
                    Http::withBasicAuth(env('IMAGEKIT_PRIVATE_KEY'), '')
                        ->delete("https://api.imagekit.io/v1/files/{$fileId}");
                }
            }
        } catch (\Exception $e) {
            \Log::error("Gagal menghapus gambar dari ImageKit: " . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $reward = Reward::find($id);

        if (!$reward) {
            return response()->json([
                'success' => false,
                'message' => 'Reward not found'
            ], 404);
        }

        // Hapus file dari ImageKit terlebih dahulu
        $this->deleteFromImageKit($reward->img);

        $reward->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reward deleted successfully'
        ]);
    }
}
