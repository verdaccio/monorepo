declare module "@verdaccio/streams" {

	declare export class UploadTarball extends PassThrough {
		storage: string;
	}

	declare export class ReadTarball extends PassThrough {
		storage: string;
	}

}