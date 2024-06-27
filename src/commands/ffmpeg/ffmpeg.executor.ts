import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { CommandExecutor } from "../../core/executor/command.executor";
import { IStreamLogger } from "../../core/handlers/stream-logger.interface";
import { ICommandExecFfmpeg, IFfmpegInput } from "./ffmpeg.types";
import { FileService } from "../../core/files/file.service";
import { PromptServiсe } from "../../core/prompt/prompt.service";
import { FfmpegBuilder } from "./ffmpeg.builder";
import { StreamHandler } from "../../core/handlers/stream.handler";

export class FfmpegExecutor extends CommandExecutor<IFfmpegInput> {

    private fileService: FileService = new FileService();
    private promptService: PromptServiсe = new PromptServiсe();

    constructor(logger: IStreamLogger) {
        super(logger);
    }

    protected async prompt(): Promise<IFfmpegInput> {
        const width = await this.promptService.input<number>('Ширини', 'number');
        const height = await this.promptService.input<number>('Висота', 'number');
        const path = await this.promptService.input<string>('Шлях до файла', 'input');
        const name = await this.promptService.input<string>('Назва файла', 'input');
        return {width, height, path, name};
    }
    protected build({width, height, path, name}: IFfmpegInput): ICommandExecFfmpeg {
        const output = this.fileService.getFilePath(path, name, 'mp4');
        const args = (new FfmpegBuilder)
        .input(path)
        .setVideoSize(width, height)
        .output(output);
        return {command: 'mp4', args, output};
    }
    protected spawn({output, command: command, args}: ICommandExecFfmpeg): ChildProcessWithoutNullStreams {
        this.fileService.deleteFileIfExists(output);
        return spawn(command, args);
    }
    protected processStream(stream: ChildProcessWithoutNullStreams, logger: IStreamLogger): void {
        const handler = new StreamHandler(logger);
        handler.processOutput(stream);
    }
}