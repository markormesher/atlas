package mapper

func Map[F, T any](source []F, f func(F) T) []T {
	if source == nil {
		return nil
	}

	output := make([]T, len(source))
	for i, v := range source {
		output[i] = f(v)
	}

	return output
}
