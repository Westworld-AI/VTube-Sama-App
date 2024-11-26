import multiprocessing
import os
import subprocess
import shutil

from log import Logger
from config import Config

logger = Logger()
config = Config()


class VideoFrameExtractProvider:

    def __init__(self) -> None:

        super(VideoFrameExtractProvider, self).__init__()

        self.path_vsf = config.VideoFrameExtractor_path

        # Copy the placeholder file to the work_dir
        run_placeholderfile_path = os.path.join(config.work_dir, 'test.srt')

        if not os.path.exists(run_placeholderfile_path):
            shutil.copy(config.VideoFrameExtractor_placeholderfile_path, run_placeholderfile_path)

        self.vsf_subtitle = run_placeholderfile_path
        self.frame_output_dir = os.path.join(config.work_dir, 'frame_output_dir')
        self.extracted_frame_folder = os.path.join(self.frame_output_dir)

        os.makedirs(self.extracted_frame_folder, exist_ok=True)

        # If self.path_vsf does not exist, throw a non-exist error
        if not os.path.exists(self.path_vsf):
            raise Exception(f"VideoSubFinderWXW does not exist! Please install it according to the README.md.")

        # Create a folder to store the extracted frames
        if not os.path.exists(self.frame_output_dir):
            os.makedirs(self.frame_output_dir)

    def delete_frame_cache(self, frame_output_dir):

        # Delete the cache of the extracted frames generated by the previous run
        if len(os.listdir(frame_output_dir)) > 0:

            for i in os.listdir(frame_output_dir):
                path = os.path.join(frame_output_dir, i)

                try:
                    if os.path.isfile(path):
                        os.remove(path)
                    elif os.path.isdir(path):
                        shutil.rmtree(path)

                except PermissionError as e:
                    logger.write(f"Permission error: {e}")
                except Exception as e:
                    logger.write(f"An error occurred: {e}")

    def run_sub_finder(self, path_vsf, video_path, frame_output_dir, vsf_subtitle):

        # path_vsf is the path of the VideoSubFinderWXW.exe
        # vsf_subtitile is the path of the extracted sub titles (no usage), it should be ended with '.srt'
        self.delete_frame_cache(frame_output_dir)

        cpu_count = max(int(multiprocessing.cpu_count() * 2 / 3), 1)
        if cpu_count < 4:
            cpu_count = max(multiprocessing.cpu_count() - 1, 1)

        top_end = 0
        bottom_end = 1
        left_end = 0
        right_end = 1
        cmd = f"{path_vsf} --use_cuda -c -r -i \"{video_path}\" -o \"{frame_output_dir}\" -ces \"{vsf_subtitle}\" "
        cmd += f"-te {top_end} -be {bottom_end} -le {left_end} -re {right_end} -nthr {cpu_count} -nocrthr {cpu_count}"

        # Execute the command
        try:
            logger.write(f"Extracting Informative Frames from {video_path} .....")

            startupinfo = None
            if os.name == 'nt':
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                startupinfo.wShowWindow = subprocess.SW_HIDE

            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                                    startupinfo=startupinfo)

            try:
                stdout, stderr = proc.communicate()

            except KeyboardInterrupt:
                logger.write(f"Frame extraction stopped")

            finally:
                if proc.poll() is None:
                    proc.terminate()

            logger.write(f"Frame Extraction Completed! Total Frames: {len(os.listdir(self.extracted_frame_folder))}")

        except Exception as e:
            logger.write(f"Frame Extraction Failed! {e}")

    def extract(self, video_path):
        video_path = os.path.normpath(video_path)
        self.run_sub_finder(self.path_vsf, video_path, self.frame_output_dir, self.vsf_subtitle)

        # List all files in the directory, get full paths of jpeg files, and extract the first 11 characters of each filename as timestamp
        extracted_frame_paths = [(os.path.join(self.extracted_frame_folder, file), file[:11]) for file in
                                 os.listdir(self.extracted_frame_folder) if
                                 file.endswith('.jpeg') or file.endswith('.jpg')]

        return extracted_frame_paths