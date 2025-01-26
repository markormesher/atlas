package convert

func ConvertSlice[F, T any](source []F, sourceErr error, f func(F) (T, error)) ([]T, error) {
	if sourceErr != nil {
		return nil, sourceErr
	}

	if source == nil {
		return nil, nil
	}

	output := make([]T, len(source))
	for i, v := range source {
		fv, err := f(v)
		if err != nil {
			return nil, err
		}
		output[i] = fv
	}

	return output, nil
}

func ConvertSlicePtr[F, T any](source []F, sourceErr error, f func(F) (T, error)) ([]*T, error) {
	if sourceErr != nil {
		return nil, sourceErr
	}

	if source == nil {
		return nil, nil
	}

	output := make([]*T, len(source))
	for i, v := range source {
		fv, err := f(v)
		if err != nil {
			return nil, err
		}
		output[i] = &fv
	}

	return output, nil
}
