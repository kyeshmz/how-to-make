import math
import signal
import sys
from math import radians

import bpy

stop_render = False


# Function to handle Ctrl+C
def signal_handler(sig, frame):
    global stop_render
    print("Render cancelled by user")
    stop_render = True

# Register the signal handler
signal.signal(signal.SIGINT, signal_handler)

# Clear existing mesh and data
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


SCALE = 0.5

# Define the duration of the animation in seconds
duration_seconds = 10  # Adjust the duration as needed

# Set the frame rate
frame_rate = 24  # Frames per second

# Calculate the total number of frames
total_frames = duration_seconds * frame_rate



# Load STL file (replace with your STL file path)
stl_file_path = "./neovius.stl"
addon_name = 'io_mesh_stl'
if addon_name not in bpy.context.preferences.addons:
    bpy.ops.preferences.addon_enable(module=addon_name)
bpy.ops.import_mesh.stl(filepath=stl_file_path)

# Set object to center of scene
obj = bpy.context.selected_objects[0]
obj.location = (0, 0, 0)


# Scale the object down to 50%
obj.scale = (SCALE,SCALE,SCALE)
bpy.context.view_layer.update()  # Update the view layer to apply the scale



# Apply a material that mixes a Principled BSDF and an Emission shader
mat = bpy.data.materials.new(name="MixedMaterial")
mat.use_nodes = True
nodes = mat.node_tree.nodes

# Clear existing nodes
for node in nodes:
    nodes.remove(node)
    
# Add Principled BSDF shader
bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
bsdf.location = (0, 0)
bsdf.inputs['Metallic'].default_value = 0.6  # Set metallic to 0.6
bsdf.inputs['Roughness'].default_value = 0.2  # Set roughness to 0.2

# Add Emission shader
emission = nodes.new(type='ShaderNodeEmission')
emission.location = (0, -200)
emission.inputs['Strength'].default_value = 1.0  # Set emission strength

# Add Mix Shader node
mix_shader = nodes.new(type='ShaderNodeMixShader')
mix_shader.location = (200, 0)
mix_shader.inputs['Fac'].default_value = 0.54  # Set mix factor to 0.54


# Add Material Output node
material_output = nodes.new(type='ShaderNodeOutputMaterial')
material_output.location = (400, 0)


# Connect nodes
mat.node_tree.links.new(bsdf.outputs['BSDF'], mix_shader.inputs[1])
mat.node_tree.links.new(emission.outputs['Emission'], mix_shader.inputs[2])
mat.node_tree.links.new(mix_shader.outputs['Shader'], material_output.inputs['Surface'])

# Assign the material to the object
obj.data.materials.append(mat)




# Calculate the distance to place the camera
obj_dimensions = obj.dimensions
max_dimension = max(obj_dimensions)
distance = max_dimension * 3.0  # Adjust the multiplier as needed

# Add camera
bpy.ops.object.camera_add(location=(distance, 0, 0))  # Initial camera location
camera = bpy.context.object
camera.rotation_euler = (radians(90), 0, radians(90))

# Set camera focal length and depth of field
camera.data.lens = 50  # Set focal length (adjust as needed)
camera.data.dof.use_dof = True
camera.data.dof.focus_distance = distance  # Set focus distance to the object's center
camera.data.dof.aperture_fstop = 2.8  # Set aperture (adjust as needed)
camera.data.clip_start = 0.001  # Set clip start to a very small value


# Set camera to point at the object
constraint = camera.constraints.new(type='TRACK_TO')
constraint.target = obj
constraint.track_axis = 'TRACK_NEGATIVE_Z'
constraint.up_axis = 'UP_Y'

# Add an empty object at the center for the camera to orbit around
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
empty = bpy.context.object

# Parent camera to the empty object
camera.parent = empty

# Set render resolution and output settings
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.filepath = "./output/frame_"  # Adjust output path
# bpy.context.scene.render.image_settings.file_format = 'FFMPEG'
# bpy.context.scene.render.filepath = "./output/animation.mp4"  # Adjust output path



# Set FFmpeg format and encoding settings
bpy.context.scene.render.ffmpeg.format = 'MPEG4'
bpy.context.scene.render.ffmpeg.codec = 'H264'
bpy.context.scene.render.ffmpeg.constant_rate_factor = 'HIGH'
bpy.context.scene.render.ffmpeg.ffmpeg_preset = 'GOOD'
bpy.context.scene.render.ffmpeg.gopsize = 12
bpy.context.scene.render.ffmpeg.video_bitrate = 6000
bpy.context.scene.render.ffmpeg.minrate = 0
bpy.context.scene.render.ffmpeg.maxrate = 9000
bpy.context.scene.render.ffmpeg.buffersize = 224 * 8
bpy.context.scene.render.ffmpeg.packetsize = 2048
bpy.context.scene.render.ffmpeg.use_max_b_frames = True

# Add HDRI lighting (replace with your HDRI file path)
hdri_path = "./belfast_sunset_2k.hdr"
world = bpy.context.scene.world
world.use_nodes = True
node_tree = world.node_tree
nodes = node_tree.nodes

# Clear existing nodes
for node in nodes:
    nodes.remove(node)

# Create HDRI background
bg_node = nodes.new(type='ShaderNodeTexEnvironment')
bg_node.image = bpy.data.images.load(hdri_path)
bg_node.location = (-300, 0)

# Background node to shader node
shader_node = nodes.new(type='ShaderNodeBackground')
shader_node.location = (-100, 0)
shader_node.inputs['Strength'].default_value = 0.8  # Set environment texture strength to 0.8


# Add output node
output_node = nodes.new(type='ShaderNodeOutputWorld')
output_node.location = (200, 0)

# Connect nodes
node_tree.links.new(bg_node.outputs["Color"], shader_node.inputs["Color"])
node_tree.links.new(shader_node.outputs["Background"], output_node.inputs["Surface"])

# Add a point light
light_distance = max_dimension * 2  # Adjust the multiplier as needed
bpy.ops.object.light_add(type='SUN', location=(light_distance, light_distance, light_distance))
light = bpy.context.object
light.data.energy = 55  # Adjust the light intensity as needed

# Animate camera rotation (360 degrees around the object)
total_frames = duration_seconds * frame_rate

bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = total_frames

angle_per_frame = 360 / total_frames  # Angle of rotation per frame


for frame in range(total_frames):
    if stop_render:
        break
    bpy.context.scene.frame_set(frame)
    empty.rotation_euler[2] = radians(frame * angle_per_frame)  # Rotate around Z-axis
    empty.keyframe_insert(data_path="rotation_euler", index=2)
    

# Set camera as the active camera
bpy.context.scene.camera = camera
# bpy.ops.wm.save_as_mainfile(filepath="./output_scene.blend")


# Render animation
try:
    bpy.ops.render.render(animation=True)
    bpy.ops.wm.quit_blender()
except KeyboardInterrupt:
    print("Render cancelled by user")
    bpy.ops.wm.quit_blender()
