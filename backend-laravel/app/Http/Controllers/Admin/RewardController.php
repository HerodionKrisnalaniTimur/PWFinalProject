<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\Request;

class RewardController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'studio' => 'required|string|max:255',
            'item_name' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
            'old_price' => 'nullable|integer|min:0',
            'img' => 'required|string',
            'tag' => 'nullable|string|max:50',
        ]);

        $reward = Reward::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Reward created successfully',
            'data' => $reward
        ], 201);
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

    public function destroy($id)
    {
        $reward = Reward::find($id);

        if (!$reward) {
            return response()->json([
                'success' => false,
                'message' => 'Reward not found'
            ], 404);
        }

        $reward->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reward deleted successfully'
        ]);
    }
}
