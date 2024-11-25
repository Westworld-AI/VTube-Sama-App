from typing import Any, Dict
import time

from log import Logger
from memory import LocalMemory
from provider.video.video_record import VideoRecordProvider

logger = Logger()
memory = LocalMemory()


class VideoClipProvider:
    def __init__(self, video_record: VideoRecordProvider):
        super(VideoClipProvider, self).__init__()
        self.video_record = video_record

    def __call__(self,
                 *args,
                 init=False,
                 **kwargs):

        if init:
            start_frame_id = self.video_record.get_current_frame_id()
            time.sleep(2)
            end_frame_id = self.video_record.get_current_frame_id()
            video_clip_path = self.video_record.get_video(start_frame_id, end_frame_id)
            screen_shot_image_path = self.video_record.extract_last_frame(video_clip_path)

            logger.write(
                f"Initiate video clip path from the screen shot by frame id ({start_frame_id}, {end_frame_id}).")

            res_params = {
                "video_clip_path": video_clip_path,
                "start_frame_id": start_frame_id,
                "end_frame_id": end_frame_id,
                "screen_shot_path": screen_shot_image_path,
            }

        else:
            start_frame_id = memory.get_recent_history("start_frame_id")[-1]
            end_frame_id = memory.get_recent_history("end_frame_id")[-1]
            video_clip_path = self.video_record.get_video(start_frame_id, end_frame_id)

            logger.write(f"Get video clip path from the memory by frame id ({start_frame_id}, {end_frame_id}).")

            res_params = {
                "video_clip_path": video_clip_path,
            }

        memory.update_info_history(res_params)

        return res_params
